// Applies supabase/migrations to DATABASE_URL (Supabase/Postgres) and seeds the
// demo catalogue (insert-if-missing: never overwrites admin edits).
//   DATABASE_URL=postgres://... pnpm db:migrate [--no-seed]
import { createPostgresDb } from "../src/lib/db/driver";
import { migrate } from "../src/lib/db/migrate";
import { seed } from "../src/lib/db/seed";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. (Local demo mode migrates PGlite automatically on first request.)");
  process.exit(1);
}
const db = await createPostgresDb(url);
try {
  await migrate(db, { log: (m) => console.log(m), localRoles: process.argv.includes("--local-roles") });
  if (!process.argv.includes("--no-seed")) {
    await seed(db);
    console.log("seeded demo catalogue (missing rows only)");
  }
  console.log("done");
} finally {
  await db.close();
}
