// Endpoint – returns the latest git commit hash, deploy timestamp, and recent 5 commits
import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

export const dynamic = "force-dynamic";

export interface GitCommitItem {
  hash: string;
  msg: string;
  fresh: boolean;
}

function getCommitInfo(): {
  hash: string;
  date: string;
  commits: GitCommitItem[];
} {
  let hash =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_COMMIT_HASH ||
    process.env.GITHUB_SHA ||
    "-";

  let date =
    process.env.VERCEL_GIT_COMMIT_DATE ||
    process.env.NEXT_PUBLIC_DEPLOY_TIME ||
    "";

  let commits: GitCommitItem[] = [];

  try {
    const rawCommits = process.env.NEXT_PUBLIC_GIT_COMMITS;
    if (rawCommits) {
      commits = JSON.parse(rawCommits);
    }
  } catch {
    // ignore
  }

  try {
    if (hash === "-" || !hash) {
      hash = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    }
    if (!date) {
      date = execSync("git log -1 --format=%cI", {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    }
    const logRaw = execSync("git log --oneline --decorate -5", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (logRaw) {
      const lines = logRaw.split("\n").filter(Boolean);
      commits = lines.map((line, idx) => {
        const spaceIdx = line.indexOf(" ");
        return {
          hash: line.slice(0, spaceIdx).trim(),
          msg: line.slice(spaceIdx + 1).trim(),
          fresh: idx === 0,
        };
      });
    }
  } catch {
    // ignore
  }

  return {
    hash: hash || "-",
    date: date || new Date().toISOString(),
    commits,
  };
}

export async function GET() {
  const info = getCommitInfo();
  let hash = info.hash;
  let deployedAt = info.date;
  let commits = info.commits;

  if (
    (hash === "-" || !deployedAt || commits.length === 0) &&
    process.env.GITHUB_PAT
  ) {
    try {
      const res = await fetch(
        "https://api.github.com/repos/zaevotic/x_zaevo-/commits?per_page=5",
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_PAT}`,
            "User-Agent": "x_zaevo-",
          },
          next: { revalidate: 60 },
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          hash = data[0].sha;
          if (data[0].commit?.committer?.date) {
            deployedAt = data[0].commit.committer.date;
          }
          commits = data.map(
            (
              c: { sha: string; commit?: { message?: string } },
              idx: number,
            ) => ({
              hash: c.sha.slice(0, 7),
              msg: `${idx === 0 ? "(HEAD -> main, origin/main) " : ""}${
                c.commit?.message?.split("\n")[0] || ""
              }`,
              fresh: idx === 0,
            }),
          );
        }
      }
    } catch {
      // ignore network error
    }
  }

  return NextResponse.json({ hash, deployedAt, commits });
}
