// Edge proxy – replaces deprecated middleware
import { db } from "@/lib/db";
import { visits } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

let isTableInitialized = false;

async function ensureTable() {
  if (isTableInitialized) return;
  try {
    await db.run(
      sql`CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)`,
    );
    const existing = await db.select().from(visits).where(eq(visits.id, 1)).get();
    if (!existing) {
      await db.insert(visits).values({ id: 1, count: 0 });
    }
    isTableInitialized = true;
  } catch (err) {
    console.error("[Visits] Failed to ensure table:", err);
  }
}

/** Increment the global visit counter on **every** request. */
export async function GET() {
  await ensureTable();

  const isDev = process.env.NODE_ENV === "development";
  let count = 0;

  try {
    if (!isDev) {
      // Atomic increment + return in 1 single query roundtrip
      const updated = await db
        .update(visits)
        .set({ count: sql<number>`${visits.count} + 1` })
        .where(eq(visits.id, 1))
        .returning({ count: visits.count });
      count = updated[0]?.count ?? 0;
    } else {
      const row = await db.select().from(visits).where(eq(visits.id, 1)).get();
      count = row?.count ?? 0;
    }
  } catch (err) {
    console.error("[Visits] Error updating counter:", err);
  }

  // Return plain Response (NextResponse.next() not allowed in App Router)
  return new Response(null, {
    status: 200,
    headers: { "x-visit-count": String(count) },
  });
}

