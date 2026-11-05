#!/usr/bin/env bun
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";

const visits = sqliteTable("visits", {
  id: integer("id").primaryKey(),
  count: integer("count").notNull(),
});

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error(
    "\x1b[31m[err]\x1b[0m TURSO_DATABASE_URL is not set in environment or .env.local",
  );
  process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client);

async function main() {
  await db.run(
    sql`CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)`,
  );

  const existing = await db
    .select()
    .from(visits)
    .where(eq(visits.id, 1))
    .get();
  const currentCount = existing?.count ?? 0;

  const arg = process.argv[2];

  if (arg === undefined) {
    console.log(`Current visits count: \x1b[36m${currentCount}\x1b[0m`);
    console.log(`To set a new number: bun run visits <number>`);
    process.exit(0);
  }

  const newCount = Math.max(0, parseInt(arg, 10));
  if (isNaN(newCount)) {
    console.error(`\x1b[31m[err]\x1b[0m Invalid number: "${arg}"`);
    process.exit(1);
  }

  if (!existing) {
    await db.insert(visits).values({ id: 1, count: newCount });
  } else {
    await db.update(visits).set({ count: newCount }).where(eq(visits.id, 1));
  }

  console.log(
    `\x1b[32m[ok]\x1b[0m Visits count updated from \x1b[33m${currentCount}\x1b[0m to \x1b[32m${newCount}\x1b[0m`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("\x1b[31m[err]\x1b[0m Failed to update visits:", err);
  process.exit(1);
});

