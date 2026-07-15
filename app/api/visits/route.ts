import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visits } from "@/lib/schema";
import { eq } from "drizzle-orm";

/** GET – return the current visitor count */
export async function GET() {
  const row = await db.select().from(visits).where(eq(visits.id, 1)).get();
  const count = row?.count ?? 0;
  return NextResponse.json({ count });
}

/** POST – manually bump the counter (optional) */
export async function POST() {
  await db.update(visits).set({ count: db.sql<number>`${visits.count} + 1` }).where(eq(visits.id, 1));
  const { count } = await db.select().from(visits).where(eq(visits.id, 1)).get();
  return NextResponse.json({ count });
}
