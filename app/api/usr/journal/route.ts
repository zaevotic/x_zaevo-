// API route that returns journal posts parsed from markdown files
import { NextResponse } from "next/server";
import matter from "gray-matter";
import fs from "fs/promises";
import path from "path";

// Using default Node.js runtime (no edge runtime)

export async function GET() {
  const dir = path.join(process.cwd(), "app/api/usr/journal/journals");
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch (e) {
    // If the folder is missing, return empty array
    return NextResponse.json([]);
  }

  const mdFiles = files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      const fileContent = await fs.readFile(path.join(dir, file), "utf8");
      const { data, content: body } = matter(fileContent);
      const id = path.parse(file).name;
      const tags = Array.isArray(data.tags)
        ? data.tags
        : data.tag
        ? [data.tag]
        : [];
      return {
        id,
        date: data.date,
        tags,
        title: data.title,
        excerpt: data.excerpt,
        body,
        callout: data.callout ?? null,
      };
    })
  );

  return NextResponse.json(posts);
}
