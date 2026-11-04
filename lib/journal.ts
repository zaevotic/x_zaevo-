import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface JournalPost {
  id: string;
  title: string;
  date: string;
  tags: string[];
  excerpt?: string;
  callout?: string | null;
  draft?: boolean;
  body: string;
  words: number;
  readTime: number;
}

const PRIMARY_JOURNAL_DIR = path.join(process.cwd(), "content/journal");
const LEGACY_JOURNAL_DIR = path.join(
  process.cwd(),
  "app/api/usr/journal/journals",
);

function readDirectoryPosts(
  dirPath: string,
  includeDrafts: boolean,
): JournalPost[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  let files: string[] = [];
  try {
    files = fs.readdirSync(dirPath);
  } catch {
    return [];
  }

  const mdFiles = files.filter(
    (f) =>
      (f.endsWith(".md") || f.endsWith(".mdx")) &&
      !f.startsWith(".") &&
      !f.startsWith("_"),
  );

  return mdFiles
    .map((file) => {
      try {
        const fullPath = path.join(dirPath, file);
        const rawContent = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(rawContent);

        // id matches file stem (e.g. 2026-10-15-niri-scrollable-compositor)
        const id = file.replace(/\.(md|mdx)$/, "");
        const rawTags = data.tags ?? data.tag ?? [];
        const tags: string[] = Array.isArray(rawTags)
          ? rawTags.map(String).map((t) => t.trim()).filter(Boolean)
          : String(rawTags)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);

        const words = content.trim().split(/\s+/).filter(Boolean).length;
        const readTime = Math.max(1, Math.round(words / 200));

        const post: JournalPost = {
          id,
          title: String(data.title || id),
          date: String(
            data.date ?? new Date().toISOString().slice(0, 10),
          ).slice(0, 10),
          tags,
          excerpt: data.excerpt ? String(data.excerpt).trim() : undefined,
          callout: data.callout ? String(data.callout).trim() : null,
          draft: Boolean(data.draft),
          body: content,
          words,
          readTime,
        };

        return post;
      } catch (err) {
        console.error(`Failed to parse journal file ${file}:`, err);
        return null;
      }
    })
    .filter((post): post is JournalPost => {
      if (!post) return false;
      if (!includeDrafts && post.draft) return false;
      return true;
    });
}

/**
 * Returns all published journal entries, sorted newest to oldest.
 */
export function getPosts(includeDrafts = false): JournalPost[] {
  const primary = readDirectoryPosts(PRIMARY_JOURNAL_DIR, includeDrafts);
  const legacy = readDirectoryPosts(LEGACY_JOURNAL_DIR, includeDrafts);

  // Combine and deduplicate by post id
  const postMap = new Map<string, JournalPost>();
  for (const post of [...primary, ...legacy]) {
    if (!postMap.has(post.id)) {
      postMap.set(post.id, post);
    }
  }

  return Array.from(postMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

/**
 * Retrieves a single post by id or slug.
 */
export function getPostById(
  id: string,
  includeDrafts = false,
): JournalPost | null {
  const posts = getPosts(includeDrafts);
  return posts.find((p) => p.id === id) ?? null;
}

