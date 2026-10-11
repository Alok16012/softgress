import { Suspense } from "react";
import { connection } from "next/server";
import { LoginForm } from "@/components/admin/AdminClient";
import { adminConfigured } from "@/lib/security/admin-auth";

export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

async function Form() {
  await connection();
  return <LoginForm configured={adminConfigured()} />;
}

export default function LoginPage() {
  return (
    <main className="flex-1 grid place-items-center bg-paper px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-ink/10 p-8 shadow-sm">
        <p className="font-extrabold tracking-[0.18em] text-sm text-ink">SOFTGRESS · CRM</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Sign in</h1>
        <div className="mt-6">
          <Suspense fallback={null}>
            <Form />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
