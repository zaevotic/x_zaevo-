"use client";

import { useState, useEffect, useRef } from "react";

interface SpotifyData {
  isPlaying: boolean;
  title: string | null;
  artist?: string;
  album?: string;
  albumArt?: string;
  url?: string;
  progress?: number;
  duration?: number;
  error?: string;
}

export default function SpotifyPanel() {
  const [track, setTrack] = useState<SpotifyData | null>(null);
  const [progress, setProgress] = useState(0);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = () => {
      fetch("/api/sys/spotify")
        .then((r) => r.json())
        .then((data: SpotifyData) => {
          setTrack(data);
          setProgress(
            data.progress && data.duration
              ? (data.progress / data.duration) * 100
              : 0,
          );

          // Clear any previous end-of-song timer
          if (endTimer.current) clearTimeout(endTimer.current);

          // Schedule a fresh fetch the moment this track should end
          // +1500ms buffer gives Spotify's API time to register the new track
          if (data.isPlaying && data.progress && data.duration) {
            const remaining = data.duration - data.progress;
            endTimer.current = setTimeout(load, remaining + 1500);
          }
        })
        .catch(() => {});
    };

    load();
    const id = setInterval(load, 30_000);
    return () => {
      clearInterval(id);
      if (endTimer.current) clearTimeout(endTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!track?.isPlaying || !track.duration) return;
    const tick = setInterval(() => {
      setProgress((prev) =>
        Math.min(100, prev + (1000 / track.duration!) * 100),
      );
    }, 1000);
    return () => clearInterval(tick);
  }, [track]);

  const title = track?.title ?? "—";
  const artist = track?.artist ?? "—";
  const album = track?.album ?? "—";

  const totalSec = track?.duration ? Math.round(track.duration / 1000) : 0;
  const elapsed = Math.round((progress / 100) * totalSec);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-full">
      {/* Vinyl disc — album art masked behind spinning grooves */}
      <div
        className="w-full max-w-[200px] aspect-square rounded-[3px] mb-[14px] relative border"
        style={{ background: "var(--bg)", borderColor: "var(--border2)" }}
      >
        {/* Spinning disc — clips everything inside to a circle */}
        <div
          className="absolute rounded-full overflow-hidden animate-[spin_8s_linear_infinite]"
          style={{ inset: 8 }}
        >
          {/* Album art base — slightly dimmed so grooves read on top */}
          {track?.albumArt && (
            <img
              src={track.albumArt}
              alt={album}
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
          )}

          {/* Vinyl groove conic-gradient — semi-transparent over the art */}
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(
                rgba(0,0,0,0.35) 0deg,   rgba(255,255,255,0.06) 18deg,
                rgba(0,0,0,0.35) 36deg,  rgba(0,0,0,0.4)        72deg,
                rgba(255,255,255,0.06) 108deg, rgba(0,0,0,0.35) 144deg,
                rgba(0,0,0,0.4)  180deg, rgba(255,255,255,0.06) 216deg,
                rgba(0,0,0,0.35) 252deg, rgba(255,255,255,0.06) 288deg,
                rgba(0,0,0,0.35) 324deg, rgba(0,0,0,0.4)        360deg
              )`,
            }}
          />

          {/* Center spindle hole */}
          <div
            className="absolute rounded-full border-[2px]"
            style={{
              width: 22,
              height: 22,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--bg1)",
              borderColor: "var(--red-dim)",
              zIndex: 10,
            }}
          />
        </div>

        {/* Static gloss reflection — sits above the spinning disc, doesn't rotate */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 8,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, transparent 48%, rgba(0,0,0,0.12) 100%)",
            zIndex: 20,
          }}
        />
      </div>
      <p className="text-[13px] mb-[3px]" style={{ color: "var(--text)" }}>
        {title}
      </p>
      <p className="text-[11px] mb-[12px]" style={{ color: "var(--text3)" }}>
        {artist} · {album}
      </p>
      {/* Progress bar */}
      <div
        className="h-[3px] rounded-[2px] mb-[6px] relative"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-full rounded-[2px] transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%`, background: "var(--red)" }}
        />
      </div>
      {/* Timestamps */}
      <div
        className="flex justify-between text-[10px] mb-[16px]"
        style={{ color: "var(--text3)" }}
      >
        <span>{fmt(elapsed)}</span>
        <span>{fmt(totalSec)}</span>
      </div>
    </div>
  );
}
