import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RawWakaItem {
  name: string;
  percent: number;
  color?: string;
  text?: string;
}

const DEFAULT_SHARE_URL =
  "https://wakatime.com/share/@cf921005-5e0d-43e9-b139-54c8592919ce/40bfc765-1294-43b1-93f5-a64fcacafa7d.json";

interface WakaPayloadObject {
  languages?: RawWakaItem[];
  human_readable_total?: string;
  human_readable_total_including_other_language?: string;
  human_readable_daily_average?: string;
  human_readable_daily_average_including_other_language?: string;
  range?: string;
}

function parseWakaData(json: unknown, fallbackRange = "7d") {
  if (!json) return null;

  let rawList: RawWakaItem[] = [];
  let total: string | undefined;
  let dailyAvg: string | undefined;
  let range = fallbackRange;

  const candidate = json as { data?: unknown };

  if (Array.isArray(candidate?.data)) {
    rawList = candidate.data as RawWakaItem[];
  } else if (Array.isArray(json)) {
    rawList = json as RawWakaItem[];
  } else if (candidate?.data && typeof candidate.data === "object") {
    const d = candidate.data as WakaPayloadObject;
    if (Array.isArray(d.languages)) {
      rawList = d.languages;
    }
    total =
      d.human_readable_total_including_other_language ||
      d.human_readable_total;
    dailyAvg =
      d.human_readable_daily_average_including_other_language ||
      d.human_readable_daily_average;
    if (d.range === "last_30_days") range = "30d";
    else if (d.range === "last_7_days") range = "7d";
  }

  const languages = rawList
    .filter((l) => l && typeof l.percent === "number" && l.percent > 0)
    .slice(0, 5)
    .map((l) => ({
      name: l.name,
      pct: Math.round(l.percent * 10) / 10,
      text: l.text || "",
    }));

  if (languages.length === 0) return null;

  return {
    languages,
    total: total || "live",
    daily_avg: dailyAvg || "0 mins",
    range,
  };
}

export async function GET() {
  try {
    // 1. Try public share JSON URL (configured or fallback)
    const shareUrl =
      process.env.WAKATIME_SHARE_URL?.trim() || DEFAULT_SHARE_URL;

    if (shareUrl) {
      try {
        const res = await fetch(shareUrl, {
          headers: { "User-Agent": "x_zaevo-" },
          next: { revalidate: 300 }, // 5 min cache
        });
        if (res.ok) {
          const json = await res.json();
          const parsed = parseWakaData(json);
          if (parsed) return NextResponse.json(parsed);
        }
      } catch (err) {
        console.warn("[WakaTime] Failed to fetch share URL:", err);
      }
    }

    // 2. Try OAuth token or API key if provided
    const token =
      process.env.WAKATIME_TOKEN?.trim() ||
      process.env.WAKATIME_API_KEY?.trim();

    if (token) {
      const isOAuth =
        token.startsWith("wakatok_") || !token.startsWith("waka_");
      const authHeaders = isOAuth
        ? { Authorization: `Bearer ${token}` }
        : {
            Authorization: `Basic ${Buffer.from(token).toString("base64")}`,
          };

      for (const range of ["last_7_days", "last_30_days"] as const) {
        try {
          const res = await fetch(
            `https://api.wakatime.com/api/v1/users/current/stats/${range}`,
            {
              headers: authHeaders,
              cache: "no-store",
            },
          );

          if (res.ok) {
            const json = await res.json();
            const parsed = parseWakaData(
              json,
              range === "last_30_days" ? "30d" : "7d",
            );
            if (parsed) return NextResponse.json(parsed);
          }
        } catch {
          // ignore and continue
        }
      }
    }

    return NextResponse.json(
      { error: "WakaTime stats unavailable", fallback: true },
      { status: 200 },
    );
  } catch (err) {
    console.error("WakaTime route error:", err);
    return NextResponse.json(
      { error: "WakaTime data unavailable", fallback: true },
      { status: 200 },
    );
  }
}
