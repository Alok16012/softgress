import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { getAdmin } from "@/lib/security/admin-auth";

/** Every admin data read goes through here: no session → login page. */
export async function requireAdmin() {
  await connection();
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return { admin, db: await getDb() };
}
