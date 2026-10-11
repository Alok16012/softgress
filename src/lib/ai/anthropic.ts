import Anthropic from "@anthropic-ai/sdk";
import { ProviderError, type ChatProvider, type ChatRequest, type ProviderEvent } from "./provider";
import { dynamicContext, stableSystemPrompt, wrapVisitor } from "./prompts";
import { briefSuggestionSchema, routeSuggestionSchema, sanitiseBriefSuggestion, toolDefinitions } from "./tools";

interface Options {
  apiKey: string;
  model: string;
  effort: "low" | "medium" | "high";
  maxTokens: number;
  timeoutMs: number;
}

/**
 * Claude via the official SDK. Streams text deltas; tool calls are converted to
 * validated *suggestions* (never executed as actions). Up to two model turns: if the
 * model stops to call a tool, we return a neutral tool_result and let it finish.
 */
export function anthropicProvider(opts: Options): ChatProvider {
  const client = new Anthropic({ apiKey: opts.apiKey, timeout: opts.timeoutMs, maxRetries: 1 });

  return {
    id: "anthropic",
    model: opts.model,
    async *stream(req: ChatRequest, signal: AbortSignal): AsyncGenerator<ProviderEvent> {
      const known = new Set(req.services.map((s) => s.slug));
      const system: Anthropic.TextBlockParam[] = [
        { type: "text", text: stableSystemPrompt(req.staff, req.departments), cache_control: { type: "ephemeral" } },
        {
          type: "text",
          text: dynamicContext({
            hits: req.hits,
            sharedBrief: req.sharedBrief,
            lang: req.lang,
            injectionReasons: req.injectionReasons,
            sensitive: req.sensitive,
          }),
        },
      ];
      const messages: Anthropic.MessageParam[] = req.history.map((t) => ({
        role: t.role,
        content: t.role === "user" ? wrapVisitor(t.content) : t.content,
      }));
      const tools = toolDefinitions([...known]) as unknown as Anthropic.Tool[];

      let usageIn = 0;
      let usageOut = 0;
      let stopReason = "end_turn";

      try {
        for (let turn = 0; turn < 2; turn++) {
          const stream = client.messages.stream(
            {
              model: opts.model,
              max_tokens: turn === 0 ? opts.maxTokens : Math.min(400, opts.maxTokens),
              system,
              messages,
              tools,
              tool_choice: { type: "auto" },
              output_config: { effort: opts.effort },
            },
            { signal },
          );

          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              yield { type: "text", text: event.delta.text };
            }
          }
          const final = await stream.finalMessage();
          usageIn += final.usage.input_tokens;
          usageOut += final.usage.output_tokens;
          stopReason = final.stop_reason ?? "end_turn";

          if (final.stop_reason === "refusal") {
            yield { type: "refusal" };
            break;
          }

          const toolUses = final.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
          // A truncated tool input can still look valid: never use tool input from a max_tokens stop.
          if (!toolUses.length || final.stop_reason === "max_tokens") break;

          const results: Anthropic.ToolResultBlockParam[] = [];
          for (const tu of toolUses) {
            if (tu.name === "suggest_brief_update") {
              const parsed = briefSuggestionSchema.safeParse(tu.input);
              const clean = parsed.success ? sanitiseBriefSuggestion(parsed.data, known) : null;
              if (clean) yield { type: "brief", suggestion: clean };
              results.push({
                type: "tool_result",
                tool_use_id: tu.id,
                is_error: !parsed.success,
                content: parsed.success
                  ? "Shown to the visitor as a suggestion. They decide whether to apply it. Do not claim it was saved."
                  : JSON.stringify({ INVALID_INPUT: "Suggestion did not match the schema and was not shown." }),
              });
            } else if (tu.name === "suggest_department") {
              const parsed = routeSuggestionSchema.safeParse(tu.input);
              if (parsed.success && parsed.data.department !== req.staff.departmentSlug) {
                yield { type: "route", suggestion: parsed.data };
              }
              results.push({
                type: "tool_result",
                tool_use_id: tu.id,
                is_error: !parsed.success,
                content: parsed.success ? "A button to visit that department was shown to the visitor." : "Invalid department suggestion; not shown.",
              });
            } else {
              results.push({ type: "tool_result", tool_use_id: tu.id, is_error: true, content: "Unknown tool." });
            }
          }

          // Only continue if the model stopped *for* the tool (it may still owe the visitor an answer).
          if (final.stop_reason !== "tool_use") break;
          messages.push({ role: "assistant", content: final.content });
          messages.push({ role: "user", content: results });
        }
      } catch (err) {
        if (signal.aborted) throw new ProviderError("provider_timeout", "Request cancelled or timed out");
        if (err instanceof Anthropic.RateLimitError) throw new ProviderError("provider_busy", "The AI service is busy");
        if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
          throw new ProviderError("provider_auth", "AI provider credentials are invalid");
        }
        if (err instanceof Anthropic.NotFoundError) throw new ProviderError("provider_error", `Model not available: ${opts.model}`);
        if (err instanceof Anthropic.APIConnectionTimeoutError) throw new ProviderError("provider_timeout", "The AI service timed out");
        if (err instanceof Anthropic.APIConnectionError) throw new ProviderError("provider_unavailable", "Couldn't reach the AI service");
        if (err instanceof Anthropic.InternalServerError) throw new ProviderError("provider_unavailable", "The AI service had an error");
        if (err instanceof Anthropic.APIError) throw new ProviderError("provider_error", `AI service error (${err.status ?? "?"})`);
        throw err;
      }

      yield { type: "done", stopReason, usage: { input: usageIn, output: usageOut } };
    },
  };
}
