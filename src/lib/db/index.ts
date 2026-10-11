import "server-only";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { env, dbDriver, isProduction } from "@/lib/env";
import { log } from "@/lib/log";
import { createPgliteDb, createPostgresDb, type Db } from "./driver";
import { migrate } from "./migrate";
import { seed } from "./seed";

declare global {
  var __sgDb: Promise<Db> | undefined;
}

async function init(): Promise<Db> {
  const e = env();
  if (dbDriver() === "postgres") {
    const db = await createPostgresDb(e.DATABASE_URL!);
    if (process.env.DB_AUTO_MIGRATE === "true") {
      await migrate(db, { log: (m) => log.info("db.migrate", { m }) });
      await seed(db);
    }
    log.info("db.ready", { driver: "postgres" });
    return db;
  }
  if (isProduction() && !e.ALLOW_PGLITE_IN_PRODUCTION) {
    throw new Error("DATABASE_URL is required in production (embedded PGlite is for local/demo use).");
  }
  const dir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), e.PGLITE_DATA_DIR);
  await mkdir(dir, { recursive: true });
  const db = await createPgliteDb(dir);
  await migrate(db, { localRoles: true, log: (m) => log.info("db.migrate", { m }) });
  await seed(db);
  log.info("db.ready", { driver: "pglite", dir: e.PGLITE_DATA_DIR });
  return db;
}

/** Process-wide database handle (survives dev HMR via globalThis). */
export function getDb(): Promise<Db> {
  globalThis.__sgDb ??= init().catch((err) => {
    globalThis.__sgDb = undefined;
    throw err;
  });
  return globalThis.__sgDb;
}
