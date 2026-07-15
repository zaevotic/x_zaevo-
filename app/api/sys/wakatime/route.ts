import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://wakatime.com/api/v1/users/current/stats/last_30_days",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.WAKATIME_API_KEY!).toString("base64")}`,
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) throw new Error(`WakaTime waka waka-ed ${res.status}`);
    const { data } = await res.json();
    return NextResponse.json({
      languages: data.languages
        .slice(0, 5)
        .map((l: { name: String; percent: number; text: string }) => ({
          name: l.name,
          pct: Math.round(l.percent * 10) / 10,
          text: l.text,
        })),
      total: data.human_readable_total,
      daily_avg: data.human_readable_daily_average,
    });
  } catch (err) {
    console.error("WakaTime unreachable:", err);
    return NextResponse.json(
      { error: "WakaTime data unavailable" },
      { status: 500 },
    );
  }
}
