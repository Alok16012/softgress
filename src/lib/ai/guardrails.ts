// Input/output guardrails for AI guides. Heuristics are a first line of defence;
// the system prompt and the "model can only suggest" architecture are the main ones.

const INJECTION_PATTERNS: [RegExp, string][] = [
  [/\b(ignore|disregard|forget|override)\b.{0,40}\b(previous|prior|above|all|earlier|system)\b.{0,40}\b(instructions?|prompts?|rules?|messages?)\b/i, "override_instructions"],
  [/\b(system|developer)\s*(prompt|message|instructions?)\b/i, "system_prompt_probe"],
  [/\b(you are now|act as|pretend to be|roleplay as|jailbreak|DAN mode|developer mode)\b/i, "persona_hijack"],
  [/\b(reveal|print|show|repeat|output)\b.{0,30}\b(prompt|instructions|rules|hidden|secret|api key|password|env)\b/i, "exfiltration"],
  [/<\/?(system|assistant|instructions?|tool|admin)>/i, "fake_tags"],
  [/\b(approve|confirm|book|mark)\b.{0,30}\b(lead|booking|appointment|discount|refund|price)\b.{0,30}\b(for me|now|automatically|without)\b/i, "action_coercion"],
  [/\b(sudo|as (an? )?admin|i am (the )?(admin|owner|developer|ceo))\b/i, "authority_claim"],
];

export interface InjectionCheck {
  flagged: boolean;
  reasons: string[];
}

export function detectInjection(text: string): InjectionCheck {
  const reasons = INJECTION_PATTERNS.filter(([re]) => re.test(text)).map(([, r]) => r);
  return { flagged: reasons.length > 0, reasons };
}

const SENSITIVE: [RegExp, string][] = [
  [/\b(?:\d[ -]?){13,19}\b/, "card_number"],
  [/\b\d{4}\s?\d{4}\s?\d{4}\b/, "aadhaar_like"],
  [/\b[A-Z]{5}\d{4}[A-Z]\b/, "pan_like"],
  [/\b(password|passwd|pwd|otp|cvv|pin)\s*[:=is]+\s*\S+/i, "secret"],
];

export function detectSensitive(text: string): string[] {
  return SENSITIVE.filter(([re]) => re.test(text)).map(([, r]) => r);
}

/** Redact sensitive patterns before the text reaches the model provider. */
export function redactSensitive(text: string): string {
  let out = text;
  for (const [re] of SENSITIVE) out = out.replace(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"), "[redacted]");
  return out;
}

const MONEY = /(₹|rs\.?|inr|\$|usd|eur|€|£|lakh|lac|crore|k\b)\s*\d|\d[\d,.]*\s*(₹|rs\.?|inr|usd|dollars|rupees|lakh|lac|crore|k)\b/i;
const GUARANTEE = /\b(guarantee[ds]?|100% (success|results)|assured results|definitely (rank|get)|pakka result)\b/i;

/**
 * Post-stream output scan. Flags monetary amounts that are not published catalogue
 * prices, and guarantee language. The UI shows a disclaimer; nothing is silently rewritten.
 */
export function scanOutput(text: string, publishedPrices: number[]): string[] {
  const warnings: string[] = [];
  if (MONEY.test(text)) {
    const nums = (text.match(/\d[\d,]*(\.\d+)?/g) ?? []).map((n) => Number(n.replace(/,/g, "")));
    const unpublished = nums.some((n) => n >= 100 && !publishedPrices.includes(n));
    if (unpublished) warnings.push("unverified_amount");
  }
  if (GUARANTEE.test(text) && !/\b(no|not|never|can't|cannot|don't|nahi|nahin)\b.{0,40}guarantee/i.test(text)) {
    warnings.push("guarantee_language");
  }
  return warnings;
}
