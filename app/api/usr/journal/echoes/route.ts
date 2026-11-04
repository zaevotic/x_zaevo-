import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { journalEchoes } from "@/lib/schema";
import { asc, eq, sql } from "drizzle-orm";

const ALLOWED_REACTIONS = ["ACK", "LGTM", "EXEC", "BUG"] as const;
type AllowedReaction = (typeof ALLOWED_REACTIONS)[number];

async function ensureEchoesTable() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS journal_echoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_slug TEXT NOT NULL,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      provider TEXT NOT NULL,
      image_url TEXT,
      content TEXT NOT NULL,
      reaction TEXT,
      created_at TEXT NOT NULL
    )
  `);
}

function resolveProvider(user: {
  externalAccounts?: Array<{ provider?: string }>;
}): string {
  const accounts = user.externalAccounts ?? [];
  for (const acc of accounts) {
    const p = String(acc.provider || "").toLowerCase();
    if (p.includes("github")) return "github";
    if (p.includes("discord")) return "discord";
    if (p.includes("google")) return "google";
  }
  return "clerk";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.trim();

    if (!slug) {
      return NextResponse.json(
        { error: "post slug is required", echoes: [], reactions: {} },
        { status: 400 },
      );
    }

    await ensureEchoesTable();

    const rows = await db
      .select()
      .from(journalEchoes)
      .where(eq(journalEchoes.postSlug, slug))
      .orderBy(asc(journalEchoes.createdAt));

    const reactions: Record<AllowedReaction, number> = {
      ACK: 0,
      LGTM: 0,
      EXEC: 0,
      BUG: 0,
    };

    for (const r of rows) {
      if (r.reaction && ALLOWED_REACTIONS.includes(r.reaction as AllowedReaction)) {
        reactions[r.reaction as AllowedReaction] =
          (reactions[r.reaction as AllowedReaction] || 0) + 1;
      }
    }

    return NextResponse.json({
      echoes: rows,
      reactions,
      total: rows.length,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to load echoes",
        detail: String(err),
        echoes: [],
        reactions: { ACK: 0, LGTM: 0, EXEC: 0, BUG: 0 },
        total: 0,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to transmit an echo" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const postSlug = String(body.postSlug ?? "").trim();
    const content = String(body.content ?? "").trim().slice(0, 280);
    const rawReaction = body.reaction ? String(body.reaction).trim().toUpperCase() : null;
    const reaction =
      rawReaction && ALLOWED_REACTIONS.includes(rawReaction as AllowedReaction)
        ? rawReaction
        : null;

    if (!postSlug) {
      return NextResponse.json(
        { error: "Target post slug is required" },
        { status: 400 },
      );
    }

    if (!content && !reaction) {
      return NextResponse.json(
        { error: "Echo must contain a message or a reaction tag" },
        { status: 400 },
      );
    }

    await ensureEchoesTable();

    const provider = resolveProvider(user);
    const username =
      user.username ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
      "operator";
    const imageUrl = user.imageUrl ?? null;
    const createdAt = new Date().toISOString();

    const result = await db
      .insert(journalEchoes)
      .values({
        postSlug,
        userId: user.id,
        username,
        provider,
        imageUrl,
        content: content || `[${reaction}]`,
        reaction,
        createdAt,
      })
      .returning();

    return NextResponse.json({
      ok: true,
      echo: result[0],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save echo", detail: String(err) },
      { status: 500 },
    );
  }
}

