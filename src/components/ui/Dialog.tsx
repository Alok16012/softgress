"use client";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Accessible modal built on the native <dialog>: focus is trapped and restored by
 * the browser, Escape closes, the page behind becomes inert.
 */
export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide,
  labelExtra,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  labelExtra?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="sg-dialog"
      style={wide ? { maxWidth: "min(980px, calc(100vw - 24px))" } : undefined}
      aria-labelledby={`${id}-t`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="glass rounded-3xl shadow-2xl flex flex-col max-h-[calc(100dvh-24px)] animate-in">
          <header className="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-white/10">
            <div className="min-w-0 flex-1">
              <h2 id={`${id}-t`} className="text-xl font-bold tracking-tight">
                {title} {labelExtra}
              </h2>
              {subtitle && <div className="mt-1 text-sm text-white/70">{subtitle}</div>}
            </div>
            <button type="button" className="hud-btn -mr-2" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </header>
          <div className="overflow-y-auto scrollbar-thin px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
