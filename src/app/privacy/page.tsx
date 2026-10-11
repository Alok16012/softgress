import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

export const metadata: Metadata = { title: "Privacy notice", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-ink/80 space-y-5 leading-relaxed">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink">Privacy notice</h1>
          <p className="text-sm text-ink/50">Template notice for the Softgress virtual HQ. Review with legal counsel before production use.</p>
          <h2 className="text-xl font-bold text-ink">AI guides</h2>
          <p>The characters you can talk to in the virtual office are AI assistants, not employees. Their replies are generated (or, in demo mode, assembled) from Softgress&apos;s approved content and may be imperfect. A person reviews every request.</p>
          <h2 className="text-xl font-bold text-ink">Conversations</h2>
          <p>Chat messages are kept in your browser&apos;s session storage and are not stored by Softgress. The server records only anonymous metadata (which guide, message counts, timestamps) linked to a random session ID. If you choose to attach your conversation when submitting a request, the transcript is stored with that request. You can reset your session from Settings at any time, which deletes local data and the session metadata.</p>
          <p>When a live AI provider is configured, your messages are sent to that provider to generate replies. Obvious sensitive data (card-like numbers, passwords) is redacted before sending. Please don&apos;t share sensitive personal data in chat.</p>
          <h2 className="text-xl font-bold text-ink">Requests</h2>
          <p>When you submit a request we store your name, the contact details you provide, your project brief, your consent choices and timestamps, to respond to your request. Marketing communication is sent only if you separately opt in.</p>
          <h2 className="text-xl font-bold text-ink">Cookies and tracking</h2>
          <p>This site uses no advertising or analytics trackers. Display preferences (quality, captions) are stored on your device. Administrators use a secure session cookie.</p>
          <h2 className="text-xl font-bold text-ink">Your choices</h2>
          <p>To access, correct or delete request data, contact the Softgress team quoting your reference code.</p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
