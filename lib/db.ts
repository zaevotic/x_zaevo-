import { drizzle } from "drizzle-orm/libsql";
// ponytail: removed unused bun:sqlite import
import { visits } from "./schema";

/** SQLite DB (file visits.db) – created automatically on first run. */
// ponytail: using libsql (Turso) for Edge‑compatible SQLite
import { createClient } from "@libsql/client";

// Turso connection – configure via env vars
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
