import "server-only";
import { aiMode, env } from "@/lib/env";
import { anthropicProvider } from "./anthropic";
import { demoProvider } from "./demo";
import type { ChatProvider } from "./provider";

export function getProvider(): ChatProvider {
  const e = env();
  if (aiMode() === "anthropic" && e.ANTHROPIC_API_KEY) {
    return anthropicProvider({
      apiKey: e.ANTHROPIC_API_KEY,
      model: e.AI_MODEL,
      effort: e.AI_EFFORT,
      maxTokens: e.AI_MAX_OUTPUT_TOKENS,
      timeoutMs: e.AI_TIMEOUT_MS,
    });
  }
  return demoProvider();
}
