import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import matter from "gray-matter";
import fs from "fs/promises";
import path from "path";
import { getPosts } from "@/lib/journal";

const JOURNALS_DIR = path.join(process.cwd(), "content/journal");

async function requireAdmin() {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  return Boolean(user && role === "admin");
}

function sanitizeId(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const posts = getPosts();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Forbidden: root admin role required" },
        { status: 403 },
      );
    }

    const payload = await req.json();
    const title = String(payload.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = sanitizeId(payload.id || title);
    if (!slug) {
      return NextResponse.json({ error: "Invalid entry slug" }, { status: 400 });
    }

    const date =
      String(payload.date ?? "").trim() ||
      new Date().toISOString().slice(0, 10);
    const rawTags = payload.tags;
    const tags: string[] = Array.isArray(rawTags)
      ? rawTags.map((t: unknown) => String(t).trim()).filter(Boolean)
      : String(rawTags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
    const excerpt = String(payload.excerpt ?? "").trim();
    const callout = payload.callout ? String(payload.callout).trim() : null;
    const body = String(payload.body ?? "");

    await fs.mkdir(JOURNALS_DIR, { recursive: true });

    const frontmatter: Record<string, unknown> = {
      title,
      date,
      tags,
      draft: Boolean(payload.draft),
      excerpt,
    };
    if (callout) {
      frontmatter.callout = callout;
    }

    const mdContent = matter.stringify(body, frontmatter);
    await fs.writeFile(path.join(JOURNALS_DIR, `${slug}.md`), mdContent, "utf8");

    const posts = getPosts(true);
    return NextResponse.json({ ok: true, id: slug, posts });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save journal entry", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Forbidden: root admin role required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id") ?? "";
    const id = sanitizeId(rawId);
    if (!id) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    for (const ext of [".md", ".mdx"]) {
      const targetPath = path.join(JOURNALS_DIR, `${id}${ext}`);
      try {
        await fs.unlink(targetPath);
      } catch {
        // Ignore if file with this extension doesn't exist
      }
    }

    const posts = getPosts(true);
    return NextResponse.json({ ok: true, posts });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete journal entry", detail: String(err) },
      { status: 500 },
    );
  }
}
