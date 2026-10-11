import { log } from "@/lib/log";

// Notification adapters. "console" is a DEVELOPMENT outbox: messages are kept in
// memory and shown at /dev/outbox (never in production). No real email/SMS/WhatsApp
// provider is assumed; add one behind this interface (docs/DEPLOYMENT.md).

export interface OutboxMessage {
  id: string;
  at: string;
  channel: "email" | "phone" | "staff";
  to: string;
  subject: string;
  body: string;
}

export interface Notifier {
  id: "console" | "none";
  /** True only if messages actually reach the recipient in this environment. */
  delivers: boolean;
  devOutbox: boolean;
  send(msg: Omit<OutboxMessage, "id" | "at">): Promise<{ delivered: boolean; outbox: boolean }>;
}

declare global {
  var __sgOutbox: OutboxMessage[] | undefined;
}

export function devOutbox(): OutboxMessage[] {
  return (globalThis.__sgOutbox ??= []);
}

export function makeNotifier(provider: "console" | "none", production: boolean): Notifier {
  if (provider === "none" || production) {
    return {
      id: "none",
      delivers: false,
      devOutbox: false,
      async send(msg) {
        log.info("notify.skipped", { channel: msg.channel, reason: "not_configured" });
        return { delivered: false, outbox: false };
      },
    };
  }
  return {
    id: "console",
    delivers: false,
    devOutbox: true,
    async send(msg) {
      const box = devOutbox();
      box.unshift({ ...msg, id: crypto.randomUUID(), at: new Date().toISOString() });
      box.length = Math.min(box.length, 100);
      log.info("notify.dev_outbox", { channel: msg.channel, subject: msg.subject });
      return { delivered: false, outbox: true };
    },
  };
}
