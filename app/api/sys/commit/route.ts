// Edge endpoint – returns the latest git commit hash (short 7‑char)
import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

export async function GET() {
  let hash = "-";
  try {
    // Use git to get the current HEAD hash; strip newline
    hash = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
  } catch (e) {
    // If git isn’t available (e.g., in production), fallback to env var
    hash = process.env.NEXT_PUBLIC_COMMIT_HASH ?? "-";
  }

  return NextResponse.json({ hash });
}
