// Endpoint – returns the latest git commit hash (short 7‑char)
import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

export const dynamic = "force-dynamic";

function getCommitHash(): string {
  const envHash =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_COMMIT_HASH ||
    process.env.GITHUB_SHA;

  if (envHash && envHash !== "-") {
    return envHash.trim();
  }

  try {
    return execSync("git rev-parse HEAD", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "-";
  }
}

export async function GET() {
  let hash = getCommitHash();

  if (hash === "-" && process.env.GITHUB_PAT) {
    try {
      const res = await fetch(
        "https://api.github.com/repos/zaevotic/x_zaevo-/commits/main",
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_PAT}`,
            "User-Agent": "x_zaevo-",
          },
          next: { revalidate: 60 },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.sha) {
          hash = data.sha;
        }
      }
    } catch {
      // ignore network error
    }
  }

  return NextResponse.json({ hash });
}
