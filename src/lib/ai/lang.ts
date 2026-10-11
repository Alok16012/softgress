export type Lang = "en" | "hi" | "hinglish";

// Frequent romanised-Hindi function words. Two or more hits (or one in a short
// message) → Hinglish.
const HINGLISH = new Set([
  "hai", "hain", "kya", "kaise", "kitna", "kitne", "kitni", "mujhe", "hume", "humein", "hamein", "aap", "aapka",
  "aapki", "mera", "meri", "mere", "chahiye", "chahte", "chahta", "chahti", "karna", "karni", "karwana", "banwana",
  "banana", "bana", "banao", "kab", "tak", "nahi", "nahin", "haan", "acha", "accha", "theek", "thik", "bhai", "yaar",
  "kaun", "kaunsa", "kahan", "kyun", "kyon", "lagega", "lagta", "lagti", "hoga", "hogi", "milega", "batao", "bataiye",
  "batayiye", "samjhao", "chalwane", "chalana", "wala", "wali", "liye", "ke", "ki", "ko", "se", "par", "aur", "bhi",
  "abhi", "jaldi", "paise", "rupaye", "dukaan", "dukan", "sakte", "sakta", "sakti", "kar", "kro", "karo", "ho",
]);

export function detectLang(text: string): Lang {
  if (/[ऀ-ॿ]/.test(text)) return "hi";
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  if (!words.length) return "en";
  let hits = 0;
  for (const w of words) if (HINGLISH.has(w)) hits++;
  // "ke", "ko", "se" alone are weak signals; require density.
  if (hits >= 2 || (hits >= 1 && words.length <= 4 && !["ho", "se", "ke", "ko", "par"].includes(words.find((w) => HINGLISH.has(w))!))) {
    return "hinglish";
  }
  return "en";
}
