import { NextResponse } from "next/server";

interface RawWakaLanguage {
  name: string;
  percent: number;
  text: string;
}

async function fetchWakaRange(range: "last_30_days" | "last_7_days", authHeader: string) {
  const res = await fetch(
    `https://wakatime.com/api/v1/users/current/stats/${range}`,
    {
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  const json = await res.json();
  const data = json?.data;
  if (!data || !Array.isArray(data.languages) || data.languages.length === 0) {
    return null;
  }

  return {
    languages: (data.languages as RawWakaLanguage[])
      .filter((l) => l.percent > 0)
      .slice(0, 5)
      .map((l) => ({
        name: l.name,
        pct: Math.round(l.percent * 10) / 10,
        text: l.text,
      })),
    total: data.human_readable_total_including_other_language || data.human_readable_total || "0 hrs",
    daily_avg:
      data.human_readable_daily_average_including_other_language ||
      data.human_readable_daily_average ||
      "0 mins",
    range: range === "last_30_days" ? "30d" : "7d",
  };
}

export async function GET() {
  try {
    const rawKey = process.env.WAKATIME_API_KEY?.trim();
    if (!rawKey) {
      return NextResponse.json(
        { error: "WAKATIME_API_KEY not configured" },
        { status: 500 },
      );
    }

    const authHeader = `Basic ${Buffer.from(rawKey).toString("base64")}`;

    // Try last_30_days first; fall back to last_7_days if free tier or 202 pending cache
    const stats =
      (await fetchWakaRange("last_30_days", authHeader)) ??
      (await fetchWakaRange("last_7_days", authHeader));

    if (!stats || stats.languages.length === 0) {
      return NextResponse.json(
        { error: "WakaTime stats pending or empty" },
        { status: 503 },
      );
    }

    return NextResponse.json(stats);
  } catch (err) {
    console.error("WakaTime unreachable:", err);
    return NextResponse.json(
      { error: "WakaTime data unavailable" },
      { status: 500 },
    );
  }
}
