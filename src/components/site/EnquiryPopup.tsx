"use client";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquareText, Phone, X } from "lucide-react";
import { EnquiryForm, type EnquiryServiceGroup } from "./EnquiryForm";

/** Seconds after the page loads before the pop-up opens on its own. */
const OPEN_DELAY_MS = 2000;
/** After an enquiry is sent, the pop-up stays away this long. */
const SENT_QUIET_MS = 30 * 86_400_000;

const DISMISSED_KEY = "sg-enquiry-popup-dismissed"; // sessionStorage: closed in this visit
const SENT_KEY = "sg-enquiry-popup-sent"; // localStorage: timestamp of the last enquiry sent

/** Pages that already are a form, or not for visitors, never open the pop-up. */
const HIDDEN_ON = ["/contact", "/get-started", "/status", "/admin", "/dev"];

function read(store: () => Storage, key: string) {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
}
function write(store: () => Storage, key: string, value: string) {
  try {
    store().setItem(key, value);
  } catch {
    /* storage blocked: the pop-up simply may show again */
  }
}

/**
 * Short enquiry pop-up that opens shortly after a visitor lands, plus a small
 * "Enquire now" button to bring it back after it is closed.
 */
export function EnquiryPopup(props: {
  groups: EnquiryServiceGroup[];
  whatsappNumber: string | null;
  mode: "save" | "direct";
  directWhatsapp: string;
  directEmail: string | null;
  phoneDisplay: string;
  phoneTel: string;
}) {
  const pathname = usePathname();
  const hidden = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false); // floating button appears only after the first auto-open decision
  const [formKey, setFormKey] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Auto-open once per visit, never for automated browsers or right after an enquiry was sent.
  useEffect(() => {
    if (hidden) return;
    const sentAt = Number(read(() => localStorage, SENT_KEY) ?? 0);
    const skip = navigator.webdriver || read(() => sessionStorage, DISMISSED_KEY) === "1" || Date.now() - sentAt < SENT_QUIET_MS;
    const t = setTimeout(() => {
      setReady(true);
      if (!skip) {
        returnFocus.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }
    }, skip ? 0 : OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [hidden]);

  const close = useCallback(() => {
    setOpen(false);
    write(() => sessionStorage, DISMISSED_KEY, "1");
    returnFocus.current?.focus?.();
  }, []);

  const openNow = () => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setFormKey((k) => k + 1); // fresh form each time it is opened by hand
    setOpen(true);
  };

  // Escape closes; Tab stays inside the dialog; the page behind does not scroll.
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    // Start in the first field, not on the close button.
    (el?.querySelector<HTMLElement>("input:not([tabindex='-1'])") ?? el?.querySelector<HTMLElement>("button"))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !el) return;
      const items = [...el.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([tabindex='-1']), select, textarea")].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (hidden) return null;

  return (
    <>
      {ready && !open && (
        <button
          type="button"
          onClick={openNow}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-[15px] font-bold text-midnight shadow-[0_12px_30px_-8px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5 hover:bg-white"
        >
          <MessageSquareText size={18} aria-hidden /> Enquire now
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
          <div aria-hidden className="absolute inset-0 bg-[#04060f]/75 backdrop-blur-sm motion-safe:animate-[fade-in_200ms_ease-out]" onClick={close} />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-popup-title"
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#070b18] text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:max-w-[560px] sm:rounded-[28px] motion-safe:animate-[pop-in_260ms_cubic-bezier(0.2,0.8,0.2,1)]"
          >
            <div className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_140%_at_0%_0%,#1d6ee4_0%,#0a1226_55%,#070b18_100%)] px-6 pb-6 pt-7 sm:px-8">
              <button type="button" onClick={close} aria-label="Close enquiry form" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
                <X size={22} aria-hidden />
              </button>
              <p className="eyebrow text-teal">Quick enquiry</p>
              <h2 id="enquiry-popup-title" className="mt-2 pr-10 font-display text-[26px] sm:text-[30px] font-bold leading-tight">
                Tell us what you need.
              </h2>
              <p className="mt-2 text-[15px] text-white/75">Leave your name and number and the Softgress team will get back to you.</p>
              <a href={`tel:${props.phoneTel}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal hover:text-white">
                <Phone size={15} aria-hidden /> Or call us now: {props.phoneDisplay}
              </a>
            </div>
            <div className="px-6 py-6 sm:px-8">
              <EnquiryForm
                key={formKey}
                variant="short"
                bare
                projectType="Website enquiry (pop-up)"
                groups={props.groups}
                whatsappNumber={props.whatsappNumber}
                mode={props.mode}
                directWhatsapp={props.directWhatsapp}
                directEmail={props.directEmail}
                onSent={() => write(() => localStorage, SENT_KEY, String(Date.now()))}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
