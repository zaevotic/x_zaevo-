import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
