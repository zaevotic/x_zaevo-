import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { leaderboard } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";

async function ensureLeaderboardTable() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      image_url TEXT,
      wpm INTEGER NOT NULL,
      raw_wpm INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      consistency INTEGER NOT NULL,
      mode TEXT NOT NULL,
      chars TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
}

async function getRankedEntries() {
  const rows = await db
    .select()
    .from(leaderboard)
    .orderBy(
      desc(leaderboard.wpm),
      desc(leaderboard.accuracy),
      desc(leaderboard.consistency),
    );
  return rows.map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }));
}

export async function GET() {
  try {
    await ensureLeaderboardTable();
    const entries = await getRankedEntries();
    return NextResponse.json({ entries });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load leaderboard", detail: String(err), entries: [] },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to submit score" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const wpm = Math.round(Number(body.wpm ?? 0));
    const rawWpm = Math.round(Number(body.rawWpm ?? wpm));
    const accuracy = Math.max(0, Math.min(100, Math.round(Number(body.accuracy ?? 0))));
    const consistency = Math.max(
      0,
      Math.min(100, Math.round(Number(body.consistency ?? 100))),
    );
    const mode = String(body.mode ?? "time 30s · english").slice(0, 64);
    const chars = String(body.chars ?? "0/0").slice(0, 32);

    if (wpm <= 0 || wpm > 350) {
      return NextResponse.json(
        { error: "Invalid WPM score out of range (1-350)" },
        { status: 400 },
      );
    }

    await ensureLeaderboardTable();

    const username =
      user.username ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
      "operator";
    const imageUrl = user.imageUrl ?? null;
    const nowIso = new Date().toISOString();

    const existing = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.userId, user.id))
      .get();

    let isPersonalBest = false;

    if (!existing) {
      isPersonalBest = true;
      await db.insert(leaderboard).values({
        userId: user.id,
        username,
        imageUrl,
        wpm,
        rawWpm,
        accuracy,
        consistency,
        mode,
        chars,
        createdAt: nowIso,
      });
    } else if (
      wpm > existing.wpm ||
      (wpm === existing.wpm && accuracy >= existing.accuracy)
    ) {
      isPersonalBest = true;
      await db
        .update(leaderboard)
        .set({
          username,
          imageUrl,
          wpm,
          rawWpm,
          accuracy,
          consistency,
          mode,
          chars,
          createdAt: nowIso,
        })
        .where(eq(leaderboard.id, existing.id));
    } else {
      // Keep personal best, refresh display metadata if changed
      if (existing.username !== username || existing.imageUrl !== imageUrl) {
        await db
          .update(leaderboard)
          .set({ username, imageUrl })
          .where(eq(leaderboard.id, existing.id));
      }
    }

    const entries = await getRankedEntries();
    const userEntry = entries.find((e) => e.userId === user.id);

    return NextResponse.json({
      entries,
      userRank: userEntry?.rank ?? null,
      bestWpm: userEntry?.wpm ?? wpm,
      isPersonalBest,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to submit score", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
    if (!user || role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: root admin role required" },
        { status: 403 },
      );
    }

    await ensureLeaderboardTable();

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      await db.delete(leaderboard);
    } else if (idParam) {
      const id = Number(idParam);
      if (!Number.isNaN(id)) {
        await db.delete(leaderboard).where(eq(leaderboard.id, id));
      }
    } else {
      return NextResponse.json(
        { error: "Specify ?id=<id> or ?all=true" },
        { status: 400 },
      );
    }

    const entries = await getRankedEntries();
    return NextResponse.json({ entries });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete leaderboard entry", detail: String(err) },
      { status: 500 },
    );
  }
}

