import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { visits } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

async function ensureVisitsRow() {
  await db.run(
    sql`CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)`,
  );
  const existing = await db.select().from(visits).where(eq(visits.id, 1)).get();
  if (!existing) {
    await db.insert(visits).values({ id: 1, count: 0 });
  }
}

/** GET – return the current visitor count and DB health */
export async function GET() {
  try {
    await ensureVisitsRow();
    const row = await db.select().from(visits).where(eq(visits.id, 1)).get();
    const count = row?.count ?? 0;
    return NextResponse.json({ count, dbStatus: "ONLINE" });
  } catch (err) {
    return NextResponse.json(
      { count: 0, dbStatus: "DEGRADED", detail: String(err) },
      { status: 200 },
    );
  }
}

/** POST – manually bump the counter */
export async function POST() {
  await ensureVisitsRow();
  await db
    .update(visits)
    .set({ count: sql<number>`${visits.count} + 1` })
    .where(eq(visits.id, 1));
  const row = await db.select().from(visits).where(eq(visits.id, 1)).get();
  const count = row?.count ?? 0;
  return NextResponse.json({ count });
}

/** PUT – Admin-only: set or reset visitor count */
export async function PUT(req: NextRequest) {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  if (!user || role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: root admin role required" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const nextCount = Math.max(0, Math.round(Number(body.count ?? 0)));

  await ensureVisitsRow();
  await db
    .update(visits)
    .set({ count: nextCount })
    .where(eq(visits.id, 1));

  return NextResponse.json({ count: nextCount, dbStatus: "ONLINE" });
}
