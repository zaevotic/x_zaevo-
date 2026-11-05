import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function getBuildCommitHash(): string {
  const envHash =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_COMMIT_HASH ||
    process.env.GITHUB_SHA;

  if (envHash && envHash !== "-") {
    return envHash.trim();
  }

  try {
    return execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "-";
  }
}

function getBuildDeployTime(): string {
  if (process.env.VERCEL_GIT_COMMIT_DATE) {
    return process.env.VERCEL_GIT_COMMIT_DATE;
  }
  try {
    const gitTime = execSync("git log -1 --format=%cI", { encoding: "utf-8" }).trim();
    if (gitTime && gitTime !== "-") {
      return gitTime;
    }
  } catch {
    // ignore
  }
  return new Date().toISOString();
}

function getBuildRecentCommits(): string {
  try {
    const logRaw = execSync("git log --oneline --decorate -5", {
      encoding: "utf-8",
    }).trim();
    if (logRaw) {
      const lines = logRaw.split("\n").filter(Boolean);
      const parsed = lines.map((line, idx) => {
        const spaceIdx = line.indexOf(" ");
        return {
          hash: line.slice(0, spaceIdx).trim(),
          msg: line.slice(spaceIdx + 1).trim(),
          fresh: idx === 0,
        };
      });
      if (parsed.length > 0) {
        return JSON.stringify(parsed);
      }
    }
  } catch {
    // ignore
  }
  return "[]";
}

const buildCommitHash = getBuildCommitHash();
const buildDeployTime = getBuildDeployTime();
const buildRecentCommits = getBuildRecentCommits();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_HASH: buildCommitHash,
    NEXT_PUBLIC_DEPLOY_TIME: buildDeployTime,
    NEXT_PUBLIC_GIT_COMMITS: buildRecentCommits,
  },
  /* config options here */
  allowedDevOrigins: ["10.166.174.16:3000", "10.166.174.16"],
  async rewrites() {
    return [
      {
        source: "/pubkey",
        destination: "/pubkey.pem",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/pubkey.pem",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
