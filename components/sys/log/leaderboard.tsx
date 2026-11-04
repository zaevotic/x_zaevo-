"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Trophy, Terminal, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";

export interface LeaderboardEntry {
  id: number;
  rank: number;
  userId: string;
  username: string;
  imageUrl?: string | null;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  chars: string;
  createdAt: string;
}

interface LeaderboardPanelProps {
  delay?: number;
  className?: string;
  compact?: boolean;
  hideFooter?: boolean;
  visibleRows?: number;
  fallbackRedirectUrl?: string;
}

export default function LeaderboardPanel({
  delay = 0.6,
  className = "",
  compact = false,
  hideFooter = false,
  visibleRows: customVisibleRows,
  fallbackRedirectUrl = "/home",
}: LeaderboardPanelProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const wheelCooldown = useRef(false);

  const visibleRows = customVisibleRows ?? (compact ? 3 : 5);

  const fetchLeaderboard = useCallback(() => {
    setLoading(true);
    fetch("/api/usr/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.entries)) {
          setEntries(data.entries);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchLeaderboard();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchLeaderboard]);

  // Real-time sync: re-fetch whenever a typing test finishes
  useEffect(() => {
    const handleUpdate = () => {
      fetchLeaderboard();
    };
    window.addEventListener("leaderboard-updated", handleUpdate);
    return () => window.removeEventListener("leaderboard-updated", handleUpdate);
  }, [fetchLeaderboard]);

  const myEntry = user
    ? entries.find((e) => e.userId === user.id)
    : undefined;

  const canScroll = entries.length > visibleRows;
  const maxOffset = Math.max(0, entries.length - visibleRows);
  const clampedOffset = Math.min(offset, maxOffset);
  const visibleEntries = entries.slice(
    clampedOffset,
    clampedOffset + visibleRows,
  );

  const stepUp = () => setOffset((prev) => Math.max(0, prev - 1));
  const stepDown = () => setOffset((prev) => Math.min(maxOffset, prev + 1));

  return (
    <Panel delay={delay} className={className}>
      <PanelHead
        meta={
          <div className="flex items-center gap-[6px]">
            <span>
              {loading
                ? "syncing… · ranks.db"
                : `${entries.length} ranked · ranks.db`}
            </span>
            <button
              type="button"
              onClick={fetchLeaderboard}
              aria-label="Refresh leaderboard"
              className="p-[2px] transition-colors cursor-pointer hover:text-[var(--red-ember)]"
              style={{
                color: "var(--text3)",
                background: "none",
                border: "none",
              }}
              title="Refresh leaderboard"
            >
              <RefreshCw size={10} />
            </button>
            {canScroll && (
              <span className="inline-flex items-center gap-[2px] ml-[2px]">
                <button
                  type="button"
                  onClick={stepUp}
                  disabled={clampedOffset === 0}
                  aria-label="Previous ranks"
                  className="p-[2px] transition-colors cursor-pointer hover:text-[var(--red)] disabled:opacity-30"
                  style={{
                    color: "var(--text3)",
                    background: "none",
                    border: "none",
                  }}
                >
                  <ChevronUp size={11} />
                </button>
                <button
                  type="button"
                  onClick={stepDown}
                  disabled={clampedOffset >= maxOffset}
                  aria-label="Next ranks"
                  className="p-[2px] transition-colors cursor-pointer hover:text-[var(--red)] disabled:opacity-30"
                  style={{
                    color: "var(--text3)",
                    background: "none",
                    border: "none",
                  }}
                >
                  <ChevronDown size={11} />
                </button>
              </span>
            )}
          </div>
        }
      >
        <Dagger /> ~/{" "}
        <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
          LEADERBOARD
        </b>
      </PanelHead>

      <PanelBody
        className={`flex flex-col h-full overflow-hidden ${
          compact ? "p-[8px_10px] gap-[6px]" : "p-[12px] gap-[10px]"
        }`}
        style={{ minHeight: 0, fontFamily: "var(--mono)" }}
      >
        {/* Auth / Operator Personal Rank Strip */}
        <div
          className={`border flex items-center justify-between gap-[8px] ${
            compact ? "px-[8px] py-[4px]" : "px-[10px] py-[7px]"
          }`}
          style={{
            background: "var(--bg2)",
            borderColor: myEntry ? "var(--red-dim)" : "var(--border)",
          }}
        >
          {!isLoaded ? (
            <span className="text-[10px]" style={{ color: "var(--text3)" }}>
              checking operator session…
            </span>
          ) : isSignedIn && user ? (
            myEntry ? (
              <div className="flex items-center justify-between w-full text-[11px]">
                <div className="flex items-center gap-[6px] min-w-0">
                  <Trophy size={11} style={{ color: "var(--amber)" }} />
                  <span className="truncate" style={{ color: "var(--text2)" }}>
                    @{myEntry.username}
                  </span>
                </div>
                <div className="flex items-center gap-[8px] shrink-0">
                  <span
                    className="px-[5px] py-[1px] text-[10px] border"
                    style={{
                      color: "var(--amber)",
                      borderColor: "var(--amber-dim)",
                      background: "var(--amber-warm-dim)",
                    }}
                  >
                    #{String(myEntry.rank).padStart(2, "0")}
                  </span>
                  <b style={{ color: "var(--red-ember)" }}>{myEntry.wpm} WPM</b>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-[10px]">
                <span className="truncate" style={{ color: "var(--text2)" }}>
                  @{user.username || user.firstName || "operator"} · unranked
                </span>
                {hideFooter ? (
                  <span className="text-[9px]" style={{ color: "var(--amber)" }}>
                    type below to rank ↓
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/term")}
                    className="cursor-pointer transition-colors hover:text-[var(--red-ember)] shrink-0"
                    style={{ color: "var(--red)" }}
                  >
                    set score →
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="flex items-center justify-between w-full text-[10px] gap-[8px]">
              <span className="truncate" style={{ color: "var(--text3)" }}>
                {"// sign in to rank score"}
              </span>
              <SignInButton mode="modal" fallbackRedirectUrl={fallbackRedirectUrl}>
                <button
                  type="button"
                  className="px-[7px] py-[2px] text-[10px] border cursor-pointer transition-colors hover:border-[var(--red-dim)] hover:text-[var(--red-ember)] shrink-0"
                  style={{
                    color: "var(--red)",
                    borderColor: "var(--border2)",
                    background: "var(--bg1)",
                  }}
                >
                  [sign in]
                </button>
              </SignInButton>
            </div>
          )}
        </div>

        {/* Column Header */}
        <div
          className="grid grid-cols-[34px_1fr_48px_58px] items-center px-[6px] pb-[3px] border-b text-[9px] uppercase tracking-[0.8px]"
          style={{ color: "var(--text3)", borderColor: "var(--border)" }}
        >
          <span>rnk</span>
          <span>operator</span>
          <span className="text-right">acc</span>
          <span className="text-right">speed</span>
        </div>

        {/* Ranked Rows Container with Wheel Pagination */}
        <div
          className="flex-1 overflow-hidden flex flex-col justify-start divide-y divide-[var(--border)] min-h-0"
          onWheel={(e) => {
            if (!canScroll || wheelCooldown.current) return;
            if (Math.abs(e.deltaY) < 10) return;
            wheelCooldown.current = true;
            if (e.deltaY > 0) stepDown();
            else stepUp();
            setTimeout(() => {
              wheelCooldown.current = false;
            }, 180);
          }}
        >
          {loading ? (
            <div className="flex flex-col gap-[4px] py-[4px]">
              {[...Array(visibleRows)].map((_, i) => (
                <div
                  key={i}
                  className={`border animate-pulse opacity-40 ${
                    compact ? "h-[28px]" : "h-[36px]"
                  }`}
                  style={{
                    background: "var(--bg2)",
                    borderColor: "var(--border)",
                  }}
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div
              className={`border border-dashed flex flex-col items-center justify-center text-center my-auto ${
                compact ? "py-[14px] px-[8px] gap-[4px]" : "py-[24px] px-[12px] gap-[6px]"
              }`}
              style={{
                borderColor: "var(--border2)",
                background: "var(--bg)",
              }}
            >
              <Trophy size={compact ? 13 : 16} style={{ color: "var(--text3)" }} />
              <p className="text-[11px]" style={{ color: "var(--text2)" }}>
                No operators ranked yet
              </p>
              <p className="text-[9px]" style={{ color: "var(--text3)" }}>
                Complete a typing test {hideFooter ? "below" : "in 3:term"} to claim #01
              </p>
            </div>
          ) : (
            visibleEntries.map((entry) => {
              const isMe = Boolean(user && entry.userId === user.id);
              const rankColor =
                entry.rank === 1
                  ? "var(--red-ember)"
                  : entry.rank === 2
                    ? "var(--amber)"
                    : entry.rank === 3
                      ? "var(--green)"
                      : "var(--text3)";

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[34px_1fr_48px_58px] items-center px-[6px] transition-colors hover:bg-[var(--red-hover-tint)] ${
                    compact ? "py-[4px]" : "py-[6px]"
                  }`}
                  style={{
                    background: isMe ? "var(--bg2)" : "transparent",
                  }}
                >
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: rankColor }}
                  >
                    #{String(entry.rank).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col min-w-0 pr-[6px]">
                    <div className="flex items-center gap-[5px] min-w-0">
                      <span
                        className="text-[11px] truncate font-medium"
                        style={{
                          color: isMe ? "var(--red-ember)" : "var(--text)",
                        }}
                      >
                        @{entry.username}
                      </span>
                      {isMe && (
                        <span
                          className="text-[8px] px-[3px] border shrink-0 leading-[1.2]"
                          style={{
                            color: "var(--red)",
                            borderColor: "var(--red-dim)",
                            background: "var(--red-mute)",
                          }}
                        >
                          you
                        </span>
                      )}
                    </div>
                    {!compact && (
                      <span
                        className="text-[9px] truncate"
                        style={{ color: "var(--text3)" }}
                      >
                        {entry.mode}
                      </span>
                    )}
                  </div>

                  <span
                    className="text-[10px] text-right tabular-nums"
                    style={{
                      color:
                        entry.accuracy >= 96
                          ? "var(--green)"
                          : entry.accuracy >= 88
                            ? "var(--amber)"
                            : "var(--text2)",
                    }}
                  >
                    {entry.accuracy}%
                  </span>

                  <div className="text-right">
                    <span
                      className="text-[12px] font-bold tabular-nums"
                      style={{
                        color:
                          entry.rank === 1 ? "var(--red-ember)" : "var(--text)",
                      }}
                    >
                      {entry.wpm}
                    </span>
                    <span
                      className="text-[8px] ml-[2px]"
                      style={{ color: "var(--text3)" }}
                    >
                      wpm
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTA to 3:term (only shown when not inside 3:term) */}
        {!hideFooter && (
          <button
            type="button"
            onClick={() => router.push("/term")}
            className="w-full px-[10px] py-[6px] border text-[10px] uppercase tracking-[1px] flex items-center justify-between cursor-pointer transition-colors hover:bg-[var(--red-hover-tint)] hover:border-[var(--red-dim)] mt-auto"
            style={{
              borderColor: "var(--border2)",
              background: "var(--bg)",
              color: "var(--text2)",
            }}
          >
            <span className="flex items-center gap-[6px]">
              <Terminal size={11} style={{ color: "var(--red)" }} />
              <span>run typing test in 3:term</span>
            </span>
            <span style={{ color: "var(--red)" }}>compete →</span>
          </button>
        )}
      </PanelBody>
    </Panel>
  );
}
