// Exercises the production Postgres driver (postgres.js over the real wire
// protocol) against embedded Postgres served on a local socket.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { createPostgresDb, type Db } from "@/lib/db/driver";
import { migrate } from "@/lib/db/migrate";
import { seed } from "@/lib/db/seed";
import * as repo from "@/lib/db/repository";
import { emptyBrief } from "@/lib/leads/schema";

const PORT = 55432 + Math.floor(Math.random() * 1000);
let pg: PGlite;
let server: PGLiteSocketServer;
let db: Db;

beforeAll(async () => {
  pg = new PGlite();
  server = new PGLiteSocketServer({ db: pg, port: PORT, host: "127.0.0.1" });
  await server.start();
  process.env.DB_POOL_MAX = "1"; // the socket server serialises connections
  db = await createPostgresDb(`postgres://postgres:postgres@127.0.0.1:${PORT}/postgres`);
  await migrate(db, { localRoles: true });
  await seed(db);
});

afterAll(async () => {
  await db?.close();
  await server?.stop();
  await pg?.close();
});

describe("postgres.js driver", () => {
  it("runs migrations, seeds and reads the catalogue", async () => {
    const services = await repo.listServices(db);
    expect(services.length).toBeGreaterThan(20);
    expect(services[0].departmentSlug).toBe("software");
  });

  it("commits submissions transactionally and replays idempotently", async () => {
    const input: repo.SubmissionInput = {
      idempotencyKey: crypto.randomUUID(),
      referenceCode: "SG-PGDR-0001",
      kind: "brief",
      contact: { name: "Driver Test", email: null, phone: "+919000000000", preferredChannel: "phone", company: null },
      marketingConsent: true,
      brief: { ...emptyBrief(), projectType: "CRM" },
      primaryServiceSlug: "crm-erp-development",
      departmentSlug: "software",
      sessionId: null,
      locale: "en",
      transcript: [],
      consultation: null,
    };
    const a = await repo.createSubmission(db, input);
    const b = await repo.createSubmission(db, { ...input, referenceCode: "SG-PGDR-0002" });
    expect(a.replayed).toBe(false);
    expect(b).toMatchObject({ replayed: true, reference: "SG-PGDR-0001" });
  });

  it("rolls back a failed transaction", async () => {
    await expect(
      db.tx(async (tx) => {
        await tx.query(`insert into public.site_settings (key, value) values ('rollback-test', '{}'::jsonb)`);
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    const rows = await db.query(`select 1 from public.site_settings where key = 'rollback-test'`);
    expect(rows).toHaveLength(0);
  });
});
