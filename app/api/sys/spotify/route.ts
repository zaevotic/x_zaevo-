import { NextResponse } from "next/server";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
    cache: "no-store",
  });

  const { access_token } = await res.json();
  return access_token;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    const nowRes = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (nowRes.status === 204) {
      const recentRes = await fetch(RECENTLY_PLAYED_URL, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      });
      const recent = await recentRes.json();
      const track = recent.items[0].track;

      return NextResponse.json({
        isPlaying: false,
        title: track.name,
        artist: track.artists.map((a: { name: string }) => a.name).join(", "),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        url: track.external_urls.spotify,
      });
    }

    const now = await nowRes.json();

    if (now.currently_playing_type !== "track") {
      return NextResponse.json({ isPlaying: false, title: null });
    }

    const track = now.item;

    return NextResponse.json({
      isPlaying: true,
      title: track.name,
      artist: track.artists.map((a: { name: string }) => a.name).join(", "),
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      url: track.external_urls.spotify,
      progress: now.progress_ms,
      duration: track.duration_ms,
    });
  } catch (err) {
    console.error("Spotify unreachable:", err);
    return NextResponse.json(
      { error: "Spotify data not quiet there yet" },
      { status: 500 },
    );
  }
}
