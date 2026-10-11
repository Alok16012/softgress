// DEMO PROVIDER — not an LLM. Used when no AI credentials are configured.
// It assembles replies from retrieved, approved content with fixed templates, so it
// can never invent facts. The UI labels every demo reply accordingly.
import type { BriefBudget, ProjectBrief, Service } from "@/lib/types";
import type { ChatProvider, ChatRequest, ProviderEvent } from "./provider";
import type { Lang } from "./lang";
import type { BriefSuggestion, RouteSuggestion } from "./tools";
import { sanitiseBriefSuggestion } from "./tools";

type L = Record<Lang, string>;
const t = (l: Lang, s: L) => s[l];

const PHRASES = {
  noInfo: {
    en: "I don't have that information here. A member of the Softgress team can answer it: you can request a callback or book a consultation from the panel.",
    hinglish: "Iski information mere paas yahan nahi hai. Softgress team ka koi member iska jawab de sakta hai: aap panel se callback request ya consultation book kar sakte hain.",
    hi: "यह जानकारी मेरे पास यहाँ उपलब्ध नहीं है। Softgress टीम का कोई सदस्य इसका जवाब दे सकता है: आप पैनल से कॉलबैक या कंसल्टेशन का अनुरोध कर सकते हैं।",
  },
  injection: {
    en: "I can't change how I work or share internal instructions, but I'm happy to help with questions about Softgress's services, process or booking.",
    hinglish: "Main apne rules change nahi kar sakta/sakti ya internal instructions share nahi kar sakta/sakti, lekin Softgress ki services, process ya booking ke baare mein zaroor help karunga/karungi.",
    hi: "मैं अपने नियम नहीं बदल सकता/सकती और आंतरिक निर्देश साझा नहीं कर सकता/सकती, लेकिन Softgress की सेवाओं, प्रक्रिया या बुकिंग के बारे में मदद कर सकता/सकती हूँ।",
  },
  identity: {
    en: "I'm an AI guide, not a human. My answers come from Softgress's approved information, and a real team member reviews every request you send.",
    hinglish: "Main ek AI guide hoon, insaan nahi. Mere jawab Softgress ki approved information se aate hain, aur aapki har request ek real team member review karta hai.",
    hi: "मैं एक AI गाइड हूँ, इंसान नहीं। मेरे जवाब Softgress की स्वीकृत जानकारी से आते हैं, और आपकी हर रिक्वेस्ट टीम का एक असली सदस्य देखता है।",
  },
  pricing: {
    en: "Custom quote required. Softgress doesn't publish a fixed price for this, because cost depends on scope. What affects it most:",
    hinglish: "Iske liye custom quote chahiye: Softgress iska fixed price publish nahi karta, kyunki cost scope pe depend karti hai. Sabse zyada farak in cheezon se padta hai:",
    hi: "इसके लिए कस्टम कोटेशन ज़रूरी है: Softgress इसकी तय कीमत प्रकाशित नहीं करता, क्योंकि लागत स्कोप पर निर्भर करती है। सबसे ज़्यादा असर इनका होता है:",
  },
  pricingTail: {
    en: "If you share a rough budget range, I'll add it to your brief so the team can quote accurately.",
    hinglish: "Agar aap rough budget range bata dein, toh main use aapke brief mein add kar dunga taaki team sahi quote de sake.",
    hi: "अगर आप एक अनुमानित बजट रेंज बताएँ, तो मैं उसे आपके ब्रीफ़ में जोड़ दूँगा ताकि टीम सही कोटेशन दे सके।",
  },
  guarantee: {
    en: "Softgress doesn't guarantee rankings, ad performance, lead volumes or revenue: results depend on your market, offer, budget, creative and competition. What is committed is defined in the signed proposal: deliverables, process and reporting.",
    hinglish: "Softgress rankings, ad performance, leads ya revenue ki guarantee nahi deta: results market, offer, budget, creative aur competition pe depend karte hain. Jo commit hota hai woh signed proposal mein hota hai: deliverables, process aur reporting.",
    hi: "Softgress रैंकिंग, विज्ञापन प्रदर्शन, लीड या राजस्व की गारंटी नहीं देता: नतीजे बाज़ार, ऑफ़र, बजट, क्रिएटिव और प्रतिस्पर्धा पर निर्भर करते हैं। जो प्रतिबद्ध होता है वह हस्ताक्षरित प्रस्ताव में तय होता है।",
  },
  timeline: {
    en: "Timelines are agreed in the proposal after scoping, so I can't promise a date. They mainly depend on scope, integrations, content readiness, approval speed and third-party reviews (like app stores or ad platforms).",
    hinglish: "Timeline scoping ke baad proposal mein tay hoti hai, isliye main koi date promise nahi kar sakta. Yeh mainly scope, integrations, content readiness, approvals ki speed aur third-party reviews (jaise app store ya ad platforms) pe depend karti hai.",
    hi: "समय-सीमा स्कोपिंग के बाद प्रस्ताव में तय होती है, इसलिए मैं कोई तारीख़ का वादा नहीं कर सकता। यह मुख्य रूप से स्कोप, इंटीग्रेशन, कंटेंट की तैयारी और अप्रूवल की गति पर निर्भर करती है।",
  },
  portfolio: {
    en: "The project gallery in our strategy room currently shows sample concept projects, clearly labelled as samples. They're not client engagements and make no results claims. Client references can be discussed with the team in a consultation.",
    hinglish: "Strategy room ki project gallery mein abhi sample concept projects hain, clearly 'sample' label ke saath. Yeh client projects nahi hain aur inme koi results claim nahi kiye gaye. Client references ke baare mein consultation mein team se baat kar sakte hain.",
    hi: "स्ट्रैटेजी रूम की प्रोजेक्ट गैलरी में अभी सैंपल कॉन्सेप्ट प्रोजेक्ट हैं, जिन पर साफ़ 'सैंपल' लेबल है। ये क्लाइंट प्रोजेक्ट नहीं हैं। क्लाइंट रेफ़रेंस के बारे में कंसल्टेशन में बात की जा सकती है।",
  },
  booking: {
    en: "You can choose Request a Quote, Book a Consultation, Request a Callback or Submit a Project Brief from the panel. A consultation is confirmed only when a connected calendar returns a real slot; otherwise your preferred time is saved as pending confirmation and the team confirms it. You'll get a reference code either way.",
    hinglish: "Panel se aap Request a Quote, Book a Consultation, Request a Callback ya Submit a Project Brief choose kar sakte hain. Consultation tabhi confirm hota hai jab connected calendar real slot deta hai, warna aapka preferred time 'pending confirmation' save hota hai aur team confirm karti hai. Dono case mein aapko reference code milega.",
    hi: "पैनल से आप कोटेशन, कंसल्टेशन, कॉलबैक या प्रोजेक्ट ब्रीफ़ चुन सकते हैं। कंसल्टेशन तभी कन्फ़र्म होता है जब कनेक्टेड कैलेंडर असली स्लॉट देता है; वरना आपका पसंदीदा समय 'पेंडिंग' के रूप में सेव होता है। दोनों में आपको एक रेफ़रेंस कोड मिलेगा।",
  },
  privacy: {
    en: "Your chat stays in your browser session and isn't stored by Softgress unless you choose to attach it to a request. You can reset your session any time from the menu, and please don't share passwords, card numbers or ID numbers here.",
    hinglish: "Aapki chat aapke browser session mein rehti hai aur Softgress use store nahi karta, jab tak aap use request ke saath attach na karein. Menu se kabhi bhi session reset kar sakte hain, aur please yahan passwords, card ya ID numbers share na karein.",
    hi: "आपकी चैट आपके ब्राउज़र सेशन में रहती है और Softgress उसे तब तक स्टोर नहीं करता जब तक आप उसे रिक्वेस्ट के साथ न जोड़ें। आप मेनू से कभी भी सेशन रीसेट कर सकते हैं।",
  },
  sensitive: {
    en: "Please don't share passwords, card numbers or ID numbers in chat. I've ignored that part.",
    hinglish: "Please chat mein passwords, card ya ID numbers share na karein. Maine woh part ignore kar diya hai.",
    hi: "कृपया चैट में पासवर्ड, कार्ड या पहचान संख्या साझा न करें। मैंने वह हिस्सा अनदेखा कर दिया है।",
  },
  deliverables: { en: "Typically includes:", hinglish: "Usually isme shamil hota hai:", hi: "आम तौर पर इसमें शामिल है:" },
  needs: { en: "To scope it, the team usually needs:", hinglish: "Scope karne ke liye team ko usually chahiye:", hi: "स्कोप करने के लिए टीम को आम तौर पर चाहिए:" },
  route: {
    en: (dept: string) => `Our ${dept} team handles this. Use the button below to walk over and continue there; your brief comes with you if you choose to share it.`,
    hinglish: (dept: string) => `Yeh kaam hamari ${dept} team handle karti hai. Neeche button se wahan chaliye; aap chahein toh aapka brief bhi saath share ho jayega.`,
    hi: (dept: string) => `यह काम हमारी ${dept} टीम संभालती है। नीचे दिए बटन से वहाँ चलिए; आप चाहें तो आपका ब्रीफ़ भी साझा हो जाएगा।`,
  },
  addedToBrief: {
    en: "I've suggested a few details for your brief. Review them below and apply only what's right.",
    hinglish: "Maine aapke brief ke liye kuch details suggest ki hain. Neeche check karke sirf sahi wali apply karein.",
    hi: "मैंने आपके ब्रीफ़ के लिए कुछ विवरण सुझाए हैं। नीचे देखकर सिर्फ़ सही वाले लागू करें।",
  },
};

const QUESTIONS: Record<string, L[]> = {
  reception: [
    { en: "What would you like to achieve: build something, grow marketing, automate a workflow, or create brand/design work?", hinglish: "Aap kya achieve karna chahte hain: kuch build karna, marketing grow karni, koi workflow automate karna, ya brand/design ka kaam?", hi: "आप क्या हासिल करना चाहते हैं: कुछ बनाना, मार्केटिंग बढ़ाना, कोई काम ऑटोमेट करना, या ब्रांड/डिज़ाइन?" },
  ],
  software: [
    { en: "Which platforms do you need: web, Android, iOS?", hinglish: "Aapko kaunse platforms chahiye: web, Android, iOS?", hi: "आपको कौन से प्लेटफ़ॉर्म चाहिए: वेब, Android, iOS?" },
    { en: "What are the must-have features for launch, and any integrations (payments, CRM, shipping)?", hinglish: "Launch ke liye must-have features kya hain, aur koi integrations (payments, CRM, shipping)?", hi: "लॉन्च के लिए ज़रूरी फ़ीचर क्या हैं, और कोई इंटीग्रेशन (पेमेंट, CRM, शिपिंग)?" },
    { en: "Do you have a target launch window and a rough budget range?", hinglish: "Koi target launch time aur rough budget range hai?", hi: "क्या कोई लक्षित लॉन्च समय और अनुमानित बजट रेंज है?" },
  ],
  marketing: [
    { en: "What's your industry and target geography?", hinglish: "Aapki industry aur target location kya hai?", hi: "आपकी इंडस्ट्री और लक्षित क्षेत्र क्या है?" },
    { en: "What's the main goal (leads, sales, awareness) and a monthly ad budget range?", hinglish: "Main goal kya hai (leads, sales, awareness) aur monthly ad budget range kitni hai?", hi: "मुख्य लक्ष्य क्या है (लीड, बिक्री, जागरूकता) और मासिक विज्ञापन बजट कितना है?" },
    { en: "Which channels have you tried before, and when would you like to launch?", hinglish: "Pehle kaunse channels try kiye hain, aur kab launch karna chahte hain?", hi: "पहले कौन से चैनल आज़माए हैं, और कब शुरू करना चाहते हैं?" },
  ],
  creative: [
    { en: "Which deliverables do you need, and do you have references you like?", hinglish: "Kaunse deliverables chahiye, aur koi references hain jo aapko pasand hain?", hi: "कौन से डिलीवरेबल्स चाहिए, और क्या कोई रेफ़रेंस हैं जो आपको पसंद हैं?" },
    { en: "Where will it be used, and what's your deadline?", hinglish: "Yeh kahan use hoga, aur deadline kya hai?", hi: "यह कहाँ इस्तेमाल होगा, और डेडलाइन क्या है?" },
  ],
  automation: [
    { en: "Which tools do you use today (CRM, WhatsApp, forms, sheets)?", hinglish: "Abhi aap kaunse tools use karte hain (CRM, WhatsApp, forms, sheets)?", hi: "अभी आप कौन से टूल इस्तेमाल करते हैं (CRM, WhatsApp, फ़ॉर्म, शीट)?" },
    { en: "Roughly how many leads or messages per day, and are there data restrictions we should know?", hinglish: "Roz lagbhag kitne leads ya messages aate hain, aur koi data restrictions hain?", hi: "रोज़ लगभग कितनी लीड या संदेश आते हैं, और क्या कोई डेटा प्रतिबंध हैं?" },
  ],
  strategy: [
    { en: "Which services are you considering, and when do you plan to decide?", hinglish: "Aap kaunsi services consider kar rahe hain, aur decision kab tak lena hai?", hi: "आप कौन सी सेवाएँ देख रहे हैं, और निर्णय कब तक लेना है?" },
    { en: "Would you prefer a quote by email or a consultation call?", hinglish: "Aapko email pe quote chahiye ya consultation call?", hi: "आपको ईमेल पर कोटेशन चाहिए या कंसल्टेशन कॉल?" },
  ],
};

const DEPT_NAME: Record<string, string> = {
  reception: "Reception",
  software: "Software Development",
  marketing: "Digital Marketing",
  creative: "Creative Studio",
  automation: "AI & Automation",
  strategy: "Client Strategy",
};

const has = (re: RegExp, s: string) => re.test(s);

// ── Requirement extraction (regex, visitor's own words only) ──────────────────
export function extractBrief(text: string, topService: Service | null): BriefSuggestion {
  const s = text.toLowerCase();
  const out: BriefSuggestion = {};

  const lakh = s.match(/(\d+(?:\.\d+)?)\s*(?:-|to|se)?\s*(?:\d+(?:\.\d+)?\s*)?(lakh|lac|lakhs|l\b)/);
  const thousand = s.match(/(\d+(?:\.\d+)?)\s*(k|thousand|hazar|hazaar)\b/);
  const crore = s.match(/(\d+(?:\.\d+)?)\s*(crore|cr)\b/);
  const rupees = s.match(/(?:₹|rs\.?|inr)\s*([\d,]{4,})/);
  let amount: number | null = null;
  if (crore) amount = Number(crore[1]) * 1e7;
  else if (lakh) amount = Number(lakh[1]) * 1e5;
  else if (thousand && /budget|₹|rs|inr|rupee|cost|spend|kharch/.test(s)) amount = Number(thousand[1]) * 1e3;
  else if (rupees) amount = Number(rupees[1].replace(/,/g, ""));
  if (amount) out.budget = bucket(amount);
  else if (/budget/.test(s) && /(not sure|pata nahi|no idea|decide nahi)/.test(s)) out.budget = "not_sure";

  const platforms: string[] = [];
  if (has(/\bandroid\b/, s)) platforms.push("Android");
  if (has(/\b(ios|iphone|ipad)\b/, s)) platforms.push("iOS");
  if (has(/\b(web|website|site|webapp|web app)\b/, s)) platforms.push("Web");
  if (platforms.length) out.platforms = platforms;

  const when =
    s.match(/\b(?:within|in|under|next)?\s*(\d+)\s*(weeks?|months?|days?|mahine|mahina|hafte|din)\b/) ??
    s.match(/\b(?:before|by|tak)\s+(diwali|holi|christmas|new year|january|february|march|april|may|june|july|august|september|october|november|december)\b/) ??
    s.match(/\b(diwali|holi|christmas)\s+(?:se pehle|tak|before)\b/);
  if (when) out.targetDate = when[0].trim();

  const INDUSTRIES: [RegExp, string][] = [
    [/\b(restaurant|cafe|café|food|cloud kitchen)\b/, "Food & beverage"],
    [/\b(clinic|hospital|doctor|dental|healthcare|pharma)\b/, "Healthcare"],
    [/\b(school|college|coaching|edtech|education|institute)\b/, "Education"],
    [/\b(real estate|property|builder|realty)\b/, "Real estate"],
    [/\b(fashion|clothing|apparel|saree|kurti|boutique)\b/, "Fashion"],
    [/\b(jewellery|jewelry)\b/, "Jewellery"],
    [/\b(salon|spa|beauty|skincare|cosmetic)\b/, "Beauty & wellness"],
    [/\b(gym|fitness|yoga)\b/, "Fitness"],
    [/\b(manufactur|factory|industrial)\w*/, "Manufacturing"],
    [/\b(travel|tour|hotel|resort)\b/, "Travel & hospitality"],
    [/\b(logistics|transport|courier)\b/, "Logistics"],
    [/\b(saas|startup)\b/, "Technology"],
  ];
  for (const [re, label] of INDUSTRIES) if (re.test(s)) { out.industry = label; break; }

  const FEATURES: [RegExp, string][] = [
    [/payment|razorpay|upi|stripe/, "Online payments"],
    [/\bcod\b|cash on delivery/, "Cash on delivery"],
    [/login|sign ?up|account/, "User accounts"],
    [/inventory|stock/, "Inventory management"],
    [/booking|appointment/, "Bookings/appointments"],
    [/admin (panel|dashboard)|dashboard/, "Admin dashboard"],
    [/notification|push/, "Notifications"],
    [/multi[- ]?vendor|marketplace/, "Multi-vendor marketplace"],
    [/tracking|track order/, "Order tracking"],
    [/whatsapp/, "WhatsApp integration"],
    [/crm/, "CRM integration"],
    [/chat ?bot|live chat/, "Chat support"],
  ];
  const feats = FEATURES.filter(([re]) => re.test(s)).map(([, f]) => f);
  if (feats.length) out.features = feats;

  if (topService) {
    out.serviceSlugs = [topService.slug];
    out.projectType = topService.title;
  }
  return out;
}

function bucket(amount: number): BriefBudget {
  if (amount < 1e5) return "under_1l";
  if (amount < 3e5) return "1l_3l";
  if (amount < 1e6) return "3l_10l";
  if (amount < 2.5e6) return "10l_25l";
  return "25l_plus";
}

function firstSentences(text: string, n: number) {
  const parts = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) ?? [text];
  return parts.slice(0, n).join(" ").trim();
}

function pickQuestion(dept: string, brief: Partial<ProjectBrief> | null, suggestion: BriefSuggestion, lang: Lang, turn: number) {
  const bank = QUESTIONS[dept] ?? QUESTIONS.reception;
  const known = { ...brief, ...suggestion };
  const filtered = bank.filter((q) => {
    if (/platform/i.test(q.en) && known.platforms?.length) return false;
    if (/budget/i.test(q.en) && known.budget) return false;
    if (/launch window|deadline|when would you/i.test(q.en) && known.targetDate) return false;
    if (/industry/i.test(q.en) && known.industry) return false;
    return true;
  });
  const list = filtered.length ? filtered : bank;
  return t(lang, list[turn % list.length]);
}

export function composeDemoReply(req: ChatRequest): { text: string; brief: BriefSuggestion | null; route: RouteSuggestion | null } {
  const lang = req.lang;
  const latest = req.history[req.history.length - 1]?.content ?? "";
  const s = latest.toLowerCase();
  const turn = req.history.filter((h) => h.role === "user").length - 1;
  const dept = req.staff.departmentSlug;
  const parts: string[] = [];

  if (req.injectionReasons.length) return { text: t(lang, PHRASES.injection), brief: null, route: null };
  if (req.sensitive.length) parts.push(t(lang, PHRASES.sensitive));

  const serviceHits = req.hits.filter((h) => h.doc.kind === "service");
  const topServiceSlug = serviceHits[0] && serviceHits[0].score > 1.2 ? serviceHits[0].doc.serviceSlug : undefined;
  const topService = topServiceSlug ? req.services.find((x) => x.slug === topServiceSlug) ?? null : null;

  const isIdentity = /\b(are you (a )?(human|real|person|bot|ai)|kaun ho|insaan ho|real ho|robot)\b/.test(s) || /क्या आप इंसान/.test(latest);
  const isGreeting = /^(hi|hello|hey|namaste|namaskar|hii+|good (morning|afternoon|evening)|नमस्ते)[\s!.,]*$/i.test(latest.trim());
  const statedBudget = Boolean(extractBrief(latest, null).budget);
  const asksPrice = /\b(price|pricing|cost|kitna|kitne|kitni|charges?|fees?|rate|quote|estimate|paise|kharcha?)\b|कितना|कीमत/.test(s);
  // "budget 3 lakh" is the visitor *telling* us a budget, not asking for a price.
  const isPricing = asksPrice || (/\bbudget\b/.test(s) && !statedBudget && /\?|kya|what|how|kaisa/.test(s));
  const isGuarantee = /\b(guarantee|guaranteed|assure|promise|pakka|100%|sure shot)\b/.test(s);
  const isTimeline = /\b(how long|timeline|kab tak|kitne din|kitna time|deadline|when can|delivery time|turnaround)\b/.test(s);
  const isPortfolio = /\b(portfolio|case stud|past work|previous work|clients?|examples?|your work|projects you)\b/.test(s);
  const isBooking = /\b(book|booking|consultation|meeting|appointment|call back|callback|talk to (a )?(human|person)|baat karni)\b/.test(s);
  const isPrivacy = /\b(privacy|my data|delete my|store my|personal data)\b/.test(s);

  if (isIdentity) parts.push(t(lang, PHRASES.identity));
  else if (isGreeting) parts.push(lang === "en" ? req.staff.greeting.en : req.staff.greeting.hinglish);
  else if (isGuarantee) parts.push(t(lang, PHRASES.guarantee));
  else if (isPricing) {
    const factors = topService?.whatWeNeed.slice(0, 4) ?? ["Scope and number of features", "Integrations", "Content and design readiness", "Timeline"];
    if (topService && topService.pricingType !== "custom" && topService.startingPrice) {
      parts.push(
        `${topService.title}: ${topService.pricingType === "fixed" ? "" : "starting at "}${topService.currency} ${topService.startingPrice.toLocaleString("en-IN")} (published price; the final quote depends on scope).`,
      );
    } else {
      parts.push(`${t(lang, PHRASES.pricing)}\n${factors.map((f) => `• ${f}`).join("\n")}${statedBudget ? "" : `\n${t(lang, PHRASES.pricingTail)}`}`);
    }
  } else if (isTimeline) parts.push(t(lang, PHRASES.timeline));
  else if (isPortfolio) parts.push(t(lang, PHRASES.portfolio));
  else if (isBooking) parts.push(t(lang, PHRASES.booking));
  else if (isPrivacy) parts.push(t(lang, PHRASES.privacy));
  else if (topService) {
    parts.push(
      `${topService.title}: ${topService.summary} ${firstSentences(topService.description, 1)}\n${t(lang, PHRASES.deliverables)}\n${topService.deliverables
        .slice(0, 4)
        .map((d) => `• ${d}`)
        .join("\n")}`,
    );
  } else {
    const kb = req.hits.find((h) => h.doc.kind === "knowledge" && h.score > 1.5);
    if (kb) parts.push(firstSentences(kb.doc.body, 3));
    else parts.push(t(lang, PHRASES.noInfo));
  }

  // Routing: explicit, never impersonating another guide.
  let route: RouteSuggestion | null = null;
  if (topService && topService.departmentSlug !== dept && dept !== "strategy") {
    route = { department: topService.departmentSlug, reason: `${topService.title} is handled by ${DEPT_NAME[topService.departmentSlug]}.` };
    parts.push(PHRASES.route[lang](DEPT_NAME[topService.departmentSlug]));
  }

  const raw = extractBrief(latest, topService);
  const known = new Set(req.services.map((x) => x.slug));
  const brief = sanitiseBriefSuggestion(raw, known);
  const meaningful = brief && Object.keys(brief).some((k) => k !== "serviceSlugs" && k !== "projectType");
  if (brief && (meaningful || topService)) parts.push(t(lang, PHRASES.addedToBrief));

  if (!isIdentity && !req.injectionReasons.length && !route) {
    parts.push(pickQuestion(dept, req.sharedBrief, brief ?? {}, lang, Math.max(0, turn)));
  }

  return { text: parts.join("\n\n"), brief, route };
}

export function demoProvider(): ChatProvider {
  return {
    id: "demo",
    model: "demo-retrieval-templates",
    async *stream(req: ChatRequest, signal: AbortSignal): AsyncGenerator<ProviderEvent> {
      const { text, brief, route } = composeDemoReply(req);
      const tokens = text.match(/\S+\s*|\n+/g) ?? [text];
      for (const tok of tokens) {
        if (signal.aborted) return;
        yield { type: "text", text: tok };
        await new Promise((r) => setTimeout(r, 14));
      }
      if (brief) yield { type: "brief", suggestion: brief };
      if (route) yield { type: "route", suggestion: route };
      yield { type: "done", stopReason: "end_turn" };
    },
  };
}
