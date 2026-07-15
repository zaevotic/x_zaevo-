// Edge proxy – replaces deprecated middleware
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visits } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

/** Increment the global visit counter on **every** request. */
export async function GET(request: Request) {
  const response = NextResponse.next();

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
  response.headers.set("x-visit-count", String(count));
  return response;
}

