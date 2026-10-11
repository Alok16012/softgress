import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Db } from "./driver";

// turbopackIgnore: these are runtime reads of SQL files; without it the bundler traces
// (and in dev, watches) the whole project, including the embedded database directory.
const root = () => process.env.SG_PROJECT_ROOT ?? process.cwd();

/** Applies supabase/migrations/*.sql in lexical order, once each. */
export async function migrate(db: Db, opts: { localRoles?: boolean; log?: (m: string) => void } = {}) {
  const log = opts.log ?? (() => {});
  if (opts.localRoles) {
    await db.exec(await readFile(path.join(/*turbopackIgnore: true*/ root(), "supabase/local/00_roles.sql"), "utf8"));
  }
  await db.exec(
    `create table if not exists public._migrations (name text primary key, applied_at timestamptz not null default now())`,
  );
  const dir = path.join(/*turbopackIgnore: true*/ root(), "supabase/migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const applied = new Set(
    (await db.query<{ name: string }>(`select name from public._migrations`)).map((r) => r.name),
  );
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(path.join(/*turbopackIgnore: true*/ dir, file), "utf8");
    await db.tx(async (tx) => {
      await tx.exec(sql);
      await tx.query(`insert into public._migrations (name) values ($1)`, [file]);
    });
    log(`applied ${file}`);
  }
}
