import type { Metadata } from "next";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Privacy notice", description: "How Softgress handles the information you share when you contact us or submit a project request.", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy notice">
        <span className="text-base text-white/60">Template notice for the Softgress website. Review with legal counsel before production use.</span>
      </PageHero>
      <main id="main" className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-steel text-[17px] space-y-5 leading-relaxed">
          <h2 className="pt-4 font-display text-2xl font-bold text-ink">Requests</h2>
          <p>When you submit a request we store your name, the contact details you provide, your project brief, your consent choices and timestamps, to respond to your request. Marketing communication is sent only if you separately opt in.</p>
          <h2 className="pt-4 font-display text-2xl font-bold text-ink">Cookies and tracking</h2>
          <p>This site uses no advertising or analytics trackers. A draft of your project brief is kept in your browser session until you submit it or close the tab. Administrators use a secure session cookie.</p>
          <h2 className="pt-4 font-display text-2xl font-bold text-ink">Your choices</h2>
          <p>To access, correct or delete request data, contact the Softgress team quoting your reference code.</p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
