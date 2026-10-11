import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { devOutbox } from "@/lib/notify/adapter";
import { getNotifier } from "@/lib/server";

export const metadata = { title: "Dev outbox", robots: { index: false } };

async function Outbox() {
  await connection();
  // Development-only: never available in production or when notifications are off.
  if (process.env.NODE_ENV === "production" || !getNotifier().devOutbox) notFound();
  const items = devOutbox();
  return (
    <ul className="mt-6 space-y-3">
      {items.length === 0 && <li className="text-ink/60">No messages yet.</li>}
      {items.map((m) => (
        <li key={m.id} className="rounded-xl border border-ink/10 p-4" data-testid="outbox-item">
          <p className="text-xs text-ink/50">{new Date(m.at).toLocaleString()} · {m.channel} → {m.to}</p>
          <p className="mt-1 font-semibold text-ink">{m.subject}</p>
          <p className="mt-1 text-sm text-ink/75">{m.body}</p>
        </li>
      ))}
    </ul>
  );
}

export default function OutboxPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-ink">Development outbox</h1>
      <p className="mt-2 text-sm text-ink/60">Messages that would be sent by email/SMS if a provider were configured. Development only.</p>
      <Suspense fallback={null}>
        <Outbox />
      </Suspense>
    </main>
  );
}
