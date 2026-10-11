// Runs the English/Hindi/Hinglish evaluation fixtures against the configured AI
// provider (live Claude when ANTHROPIC_API_KEY is set, else the demo provider).
//   ANTHROPIC_API_KEY=... pnpm eval:ai
// Each live case costs a few cents; results are printed, never stored.
import { createPgliteDb } from "../src/lib/db/driver";
import { migrate } from "../src/lib/db/migrate";
import { seed } from "../src/lib/db/seed";
import { runChat, chatRequestSchema } from "../src/lib/ai/chat-service";
import { anthropicProvider } from "../src/lib/ai/anthropic";
import { demoProvider } from "../src/lib/ai/demo";
import { evalCases } from "../tests/fixtures/ai-evals";

const key = process.env.ANTHROPIC_API_KEY;
const provider = key
  ? anthropicProvider({ apiKey: key, model: process.env.AI_MODEL ?? "claude-opus-5-5", effort: "low", maxTokens: 1200, timeoutMs: 60000 })
  : demoProvider();
console.log(`provider: ${provider.id} (${provider.model})\n`);

const db = await createPgliteDb();
await migrate(db, { localRoles: true });
await seed(db);

let pass = 0;
for (const c of evalCases) {
  const body = chatRequestSchema.parse({
    sessionId: crypto.randomUUID(),
    staffId: c.staffId,
    messages: c.messages.map((m) => ({ role: "user", content: m })).slice(-1),
  });
  let text = "";
  let route: string | undefined;
  let brief: Record<string, unknown> | undefined;
  for await (const e of runChat({ db, provider, timeoutMs: 60000 }, body, new AbortController().signal)) {
    if (e.event === "delta") text += e.data.text;
    if (e.event === "route") route = e.data.department;
    if (e.event === "brief") brief = e.data.suggestion;
  }
  const problems: string[] = [];
  if (c.mustIncludeAny && !c.mustIncludeAny.some((s) => text.toLowerCase().includes(s.toLowerCase()))) problems.push(`missing one of ${JSON.stringify(c.mustIncludeAny)}`);
  for (const re of c.mustNotMatch ?? []) if (re.test(text)) problems.push(`matched forbidden ${re}`);
  if (c.expectRoute && route !== c.expectRoute) problems.push(`route ${route} ≠ ${c.expectRoute}`);
  if (c.expectBrief) for (const [k, v] of Object.entries(c.expectBrief)) if (JSON.stringify(brief?.[k]) !== JSON.stringify(v)) problems.push(`brief.${k}=${JSON.stringify(brief?.[k])}`);
  const ok = problems.length === 0;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.id}${ok ? "" : `\n      ${problems.join("\n      ")}\n      reply: ${text.slice(0, 240).replace(/\n/g, " ")}`}`);
}
console.log(`\n${pass}/${evalCases.length} passed`);
await db.close();
process.exit(pass === evalCases.length ? 0 : 1);
