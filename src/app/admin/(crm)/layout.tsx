import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { LogoutButton } from "@/components/admin/AdminClient";
import { requireAdmin } from "@/lib/admin-data";

export const metadata = { title: "CRM", robots: { index: false, follow: false } };

async function Who() {
  const { admin } = await requireAdmin();
  return (
    <span className="text-sm text-white/70">
      {admin.email} · <span className="uppercase tracking-wide text-mint">{admin.role}</span>
    </span>
  );
}

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col bg-paper">
      <header className="bg-midnight text-white">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-extrabold tracking-[0.18em] text-sm">
            <Image src="/brand/softgress-mark.png" alt="" width={24} height={24} className="h-6 w-6" />
            SOFTGRESS CRM
          </Link>
          <nav aria-label="CRM" className="flex items-center gap-1 text-sm">
            {[
              ["/admin", "Inbox"],
              ["/admin/board", "Pipeline"],
              ["/admin/services", "Services"],
              ["/admin/knowledge", "Knowledge"],
              ["/admin/audit", "Audit log"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="px-3 py-1.5 rounded-lg hover:bg-white/10">{label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Suspense fallback={null}><Who /></Suspense>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
