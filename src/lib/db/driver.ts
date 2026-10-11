// Thin SQL driver abstraction so one repository runs on embedded PGlite (demo/local)
// and on real Postgres (Supabase) via DATABASE_URL. Server-only by construction:
// imported exclusively from route handlers, server components and scripts.

export interface Db {
  readonly kind: "pglite" | "postgres";
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Execute a multi-statement script without parameters. */
  exec(sql: string): Promise<void>;
  tx<T>(fn: (db: Db) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

type PGliteLike = {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<unknown>;
  transaction<T>(fn: (tx: PGliteTx) => Promise<T>): Promise<T>;
  close(): Promise<void>;
};
type PGliteTx = {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<unknown>;
};

export async function createPgliteDb(dataDir?: string): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const pg = (dataDir ? new PGlite(dataDir) : new PGlite()) as unknown as PGliteLike;

  const wrapTx = (tx: PGliteTx): Db => ({
    kind: "pglite",
    query: async <T>(sql: string, params?: unknown[]) => (await tx.query<T>(sql, params)).rows,
    exec: async (sql: string) => {
      await tx.exec(sql);
    },
    tx: (fn) => fn(wrapTx(tx)), // nested: reuse the open transaction
    close: async () => {},
  });

  return {
    kind: "pglite",
    query: async <T>(sql: string, params?: unknown[]) => (await pg.query<T>(sql, params)).rows,
    exec: async (sql: string) => {
      await pg.exec(sql);
    },
    tx: (fn) => pg.transaction((tx) => fn(wrapTx(tx))),
    close: () => pg.close(),
  };
}

export async function createPostgresDb(url: string): Promise<Db> {
  const { default: postgres } = await import("postgres");
  const sql = postgres(url, {
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // compatible with Supabase transaction pooler (pgbouncer)
    onnotice: () => {},
  });

  // Structural type covering both the root client and a transaction handle.
  type Q = { unsafe: (text: string, params?: never[]) => Promise<unknown> };
  const wrap = (q: Q, root: boolean): Db => ({
    kind: "postgres",
    query: async <T>(text: string, params: unknown[] = []) => (await q.unsafe(text, params as never[])) as T[],
    exec: async (text: string) => {
      await q.unsafe(text);
    },
    tx: async (fn) => {
      if (!root) return fn(wrap(q, false));
      return (await sql.begin((t) => fn(wrap(t as unknown as Q, false)))) as never;
    },
    close: async () => {
      if (root) await sql.end({ timeout: 5 });
    },
  });
  return wrap(sql as unknown as Q, true);
}
