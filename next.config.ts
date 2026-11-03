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

const buildCommitHash = getBuildCommitHash();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_HASH: buildCommitHash,
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
