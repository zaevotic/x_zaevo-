"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";

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

interface SpotifyPanelProps {
  delay?: number;
  className?: string;
}

let cachedSpotifyData: SpotifyData | null = null;

export default function SpotifyPanel({
  delay = 0,
  className = "",
}: SpotifyPanelProps) {
  const [track, setTrack] = useState<SpotifyData | null>(() => cachedSpotifyData);
  const [loading, setLoading] = useState(!cachedSpotifyData);
  const [progress, setProgress] = useState(() =>
    cachedSpotifyData?.progress && cachedSpotifyData.duration
      ? (cachedSpotifyData.progress / cachedSpotifyData.duration) * 100
      : 0,
  );
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = () => {
      fetch("/api/sys/spotify")
        .then((r) => r.json())
        .then((data: SpotifyData) => {
          setTrack(data);
          cachedSpotifyData = data;
          setProgress(
            data.progress && data.duration
              ? (data.progress / data.duration) * 100
              : 0,
          );

          // Clear any previous end-of-song timer
          if (endTimer.current) clearTimeout(endTimer.current);

          // Schedule a fresh fetch the moment this track should end
          if (data.isPlaying && data.progress && data.duration) {
            const remaining = data.duration - data.progress;
            endTimer.current = setTimeout(load, remaining + 1500);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
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

  const metaText = loading
    ? "syncing… · spotify.rc"
    : track?.isPlaying
      ? "live · spotify.rc"
      : track?.title
        ? "recent · spotify.rc"
        : "idle · spotify.rc";

  return (
    <Panel delay={delay} className={className}>
      <PanelHead
        meta={
          <div className="flex items-center gap-[6px]">
            {!loading && track?.isPlaying && (
              <span
                className="inline-flex items-end gap-[1.5px] h-[9px] mr-[2px]"
                title="audio stream active"
              >
                <span className="w-[2px] h-[9px] bg-[var(--red)] animate-pulse" />
                <span
                  className="w-[2px] h-[5px] bg-[var(--red)] animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-[2px] h-[8px] bg-[var(--red)] animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            )}
            <span>{metaText}</span>
          </div>
        }
      >
        <Dagger /> ~/{" "}
        <b style={{ color: "var(--text)", letterSpacing: "1px" }}>SPOTIFY</b>
      </PanelHead>
      <PanelBody>
        <div className="flex flex-col h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="spotify-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.25 }}
                className="flex flex-col h-full"
              >
                {/* Album row skeleton */}
                <div className="flex items-center gap-[16px] mb-[14px]">
                  <div
                    className="w-[120px] h-[120px] rounded-[3px] relative border shrink-0 opacity-40 animate-pulse flex items-center justify-center"
                    style={{
                      background: "var(--bg)",
                      borderColor: "var(--border2)",
                    }}
                  >
                    <div
                      className="rounded-full border border-dashed border-[var(--border)] opacity-60"
                      style={{ width: "70%", height: "70%" }}
                    />
                    <div
                      className="absolute rounded-full border-[2px]"
                      style={{
                        width: 20,
                        height: 20,
                        background: "var(--bg1)",
                        borderColor: "var(--border2)",
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-[8px] opacity-40 animate-pulse">
                    <div
                      className="h-[34px] w-[110px] rounded-[2px]"
                      style={{ background: "var(--border2)" }}
                    />
                  </div>
                </div>

                {/* Title and artist skeleton */}
                <div className="flex flex-col gap-[6px] mb-[12px] opacity-40 animate-pulse">
                  <div
                    className="h-[14px] w-[60%] rounded-[2px]"
                    style={{ background: "var(--border2)" }}
                  />
                  <div
                    className="h-[11px] w-[40%] rounded-[2px]"
                    style={{ background: "var(--border2)" }}
                  />
                </div>

                {/* Progress bar skeleton */}
                <div
                  className="h-[3px] rounded-[2px] mb-[6px] relative opacity-40"
                  style={{ background: "var(--border)" }}
                />
                <div className="flex justify-between text-[10px] mb-[16px] opacity-40">
                  <div
                    className="h-[10px] w-[24px] rounded-[2px]"
                    style={{ background: "var(--border2)" }}
                  />
                  <div
                    className="h-[10px] w-[24px] rounded-[2px]"
                    style={{ background: "var(--border2)" }}
                  />
                </div>
              </motion.div>
            ) : !track?.title ? (
              <motion.div
                key="spotify-idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-[28px] text-[11px] uppercase tracking-[1px]"
                style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
              >
                {"// spotify idle · no stream"}
              </motion.div>
            ) : (
              <motion.div
                key="spotify-loaded"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col h-full"
              >
                {/* Album row — vinyl disc + play button side by side */}
                <div className="flex items-center gap-[16px] mb-[14px]">
                  {/* Vinyl disc — album art masked behind spinning grooves */}
                  <div
                    className="w-[120px] h-[120px] rounded-[3px] relative border shrink-0"
                    style={{
                      background: "var(--bg)",
                      borderColor: "var(--border2)",
                    }}
                  >
                    {/* Spinning disc — clips everything inside to a circle */}
                    <div
                      className="absolute rounded-full overflow-hidden animate-[spin_8s_linear_infinite]"
                      style={{
                        inset: 6,
                        animationPlayState: track.isPlaying
                          ? "running"
                          : "paused",
                      }}
                    >
                      {/* Album art base — slightly dimmed so grooves read on top */}
                      {track.albumArt && (
                        <motion.img
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.75 }}
                          transition={{ duration: 0.4 }}
                          src={track.albumArt}
                          alt={album}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}

                      {/* Vinyl groove conic-gradient — semi-transparent over the art */}
                      <div
                        className="absolute inset-0 pointer-events-none"
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
                          width: 20,
                          height: 20,
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
                        inset: 6,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, transparent 48%, rgba(0,0,0,0.12) 100%)",
                        zIndex: 20,
                      }}
                    />
                  </div>

                  {/* Play on Spotify — sits to the right of the vinyl */}
                  {track.url && (
                    <motion.a
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-[8px] px-[16px] py-[10px] text-[11px] tracking-[1.5px] uppercase font-bold cursor-pointer transition-opacity no-underline hover:opacity-80"
                      style={{
                        background: "var(--red)",
                        color: "var(--bg)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      <span style={{ fontSize: "14px", lineHeight: 1 }}>
                        ▶
                      </span>
                      play song
                    </motion.a>
                  )}
                </div>

                <p
                  className="text-[13px] mb-[3px] font-medium truncate"
                  style={{ color: "var(--text)" }}
                  title={title}
                >
                  {title}
                </p>
                <p
                  className="text-[11px] mb-[12px] truncate"
                  style={{ color: "var(--text3)" }}
                  title={`${artist} · ${album}`}
                >
                  {artist} · {album}
                </p>

                {/* Progress bar */}
                <div
                  className="h-[3px] rounded-[2px] mb-[6px] relative overflow-hidden"
                  style={{ background: "var(--border)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{
                      duration: 0.85,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full rounded-[2px]"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--red-dim), var(--red-ember))",
                    }}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PanelBody>
    </Panel>
  );
}
