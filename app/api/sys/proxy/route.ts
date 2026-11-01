// Edge proxy – replaces deprecated middleware
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visits } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

/** Increment the global visit counter on **every** request. */
export async function GET(request: Request) {
  // Ensure the `visits` table exists – run a lightweight CREATE IF NOT EXISTS on first hit
  await db.run(sql`CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)`);

  // Ensure a row exists (id = 1). Create if missing.
  const existing = await db.select().from(visits).where(eq(visits.id, 1)).get();
  if (!existing) {
    await db.insert(visits).values({ id: 1, count: 0 });
  }

  // Atomically increment the counter.
  await db
    .update(visits)
    .set({ count: sql<number>`${visits.count} + 1` })
    .where(eq(visits.id, 1));

  // Read the new count.
  const { count } = await db.select().from(visits).where(eq(visits.id, 1)).get();
  // Return plain Response (NextResponse.next() not allowed in App Router)
  return new Response(null, {
    status: 200,
    headers: { "x-visit-count": String(count) },
  });
}

