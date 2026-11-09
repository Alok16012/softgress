// Tells IndexNow search engines (Bing, which also feeds Copilot and ChatGPT search, plus Yandex,
// Seznam and others) that pages changed, so they are recrawled within days instead of weeks.
// Run after a deploy is live:
//   pnpm indexnow                      → every URL in the live sitemap
//   pnpm indexnow /blog/new-guide ...  → only these paths
// The key file is public/<KEY>.txt; IndexNow fetches it to confirm we own the domain.

const KEY = "29fba5a5d0f93d9f5fa44119d9833707";
const SITE = (process.env.SITE_URL || "https://softgress.com").replace(/\/+$/, "");
const host = new URL(SITE).host;

async function sitemapUrls(): Promise<string[]> {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.trim());
}

const paths = process.argv.slice(2);
const urlList = paths.length ? paths.map((p) => (p.startsWith("http") ? p : `${SITE}${p.startsWith("/") ? p : `/${p}`}`)) : await sitemapUrls();
if (!urlList.length) {
  console.error("No URLs to submit.");
  process.exit(1);
}

const keyCheck = await fetch(`${SITE}/${KEY}.txt`);
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
  console.error(`Key file ${SITE}/${KEY}.txt is not live yet. Deploy first, then run again.`);
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
// 200 = accepted, 202 = accepted and key validation pending.
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URL(s)`);
if (res.status >= 300) {
  console.error(await res.text());
  process.exit(1);
}
