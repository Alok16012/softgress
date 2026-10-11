import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { audit, listLeads } from "@/lib/db/repository";
import { adminFromRequest, can } from "@/lib/security/admin-auth";
import { problem } from "@/lib/security/request";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Neutralise spreadsheet formula injection and quote everything.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  await connection();
  const admin = adminFromRequest(req);
  if (!admin) return problem(401, "unauthorised", "Sign in required.");
  if (!can(admin.role, "leads:export")) return problem(403, "forbidden", "Your role can't export leads.");
  const db = await getDb();
  const rows = await listLeads(db);
  await audit(db, admin.id, "leads.export", "lead", "*", { count: rows.length });
  const header = ["created_at", "reference", "name", "email", "phone", "stage", "department", "kind", "service", "consultation", "possible_duplicate"];
  const lines = rows.map((r) => [r.createdAt, r.reference, r.name, r.email, r.phone, r.stage, r.department, r.kind, r.service, r.consultationStatus, r.possibleDuplicate].map(esc).join(","));
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="softgress-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
