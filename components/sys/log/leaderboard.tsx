"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Trophy, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import {
  LEADERBOARD_CATEGORIES,
  SUB_CATEGORIES,
  DEFAULT_SUB,
  parseLeaderboardMode,
  type MainCategory,
  type SubCategory,
} from "@/lib/leaderboard";

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

let cachedLeaderboardEntries: LeaderboardEntry[] | null = null;

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
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => cachedLeaderboardEntries ?? []);
  const [loading, setLoading] = useState(!cachedLeaderboardEntries);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [mainCategory, setMainCategory] = useState<MainCategory>("time");
  const [subCategory, setSubCategory] = useState<SubCategory>("30s");
  const wheelCooldown = useRef(false);
  const hasLoadedOnce = useRef(Boolean(cachedLeaderboardEntries));

  const visibleRows = customVisibleRows ?? (compact ? 3 : 5);
  const rowHeight = compact ? 38 : 46;
  const listHeight = visibleRows * rowHeight;

  const fetchLeaderboard = useCallback(() => {
    if (!cachedLeaderboardEntries && !hasLoadedOnce.current) {
      setLoading(true);
    }
    setIsRefreshing(true);
    fetch("/api/usr/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.entries)) {
          setEntries(data.entries);
          cachedLeaderboardEntries = data.entries;
          hasLoadedOnce.current = true;
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
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

  // Divided competitively into Time, Word, Quote with 3 sub-modes each
  const filteredEntries = useMemo(() => {
    const list: (LeaderboardEntry & { subLabel: string })[] = [];
    for (const e of entries) {
      const p = parseLeaderboardMode(e.mode);
      if (p.category === mainCategory && p.subCategory === subCategory) {
        list.push({ ...e, subLabel: p.label });
      }
    }
    // Highest WPM first, breaking ties with accuracy then consistency
    list.sort(
      (a, b) =>
        b.wpm - a.wpm ||
        b.accuracy - a.accuracy ||
        b.consistency - a.consistency,
    );
    // Dynamically assign ranks within this exact mode/subcategory
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [entries, mainCategory, subCategory]);

  const myEntry = user
    ? filteredEntries.find((e) => e.userId === user.id)
    : undefined;

  const canScroll = filteredEntries.length > visibleRows;
  const maxOffset = Math.max(0, filteredEntries.length - visibleRows);
  const clampedOffset = Math.min(offset, maxOffset);
  const visibleEntries = filteredEntries.slice(
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
              {loading && entries.length === 0
                ? `syncing… · ${mainCategory}:${subCategory}`
                : `${filteredEntries.length} ranked · ${mainCategory}:${subCategory}`}
            </span>
            <button
              type="button"
              onClick={fetchLeaderboard}
              aria-label="Refresh leaderboard"
              className={`p-[2px] transition-colors cursor-pointer hover:text-[var(--red-ember)] ${
                isRefreshing ? "animate-spin text-[var(--red-ember)]" : ""
              }`}
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
          className={`border flex items-center justify-between gap-[8px] overflow-hidden ${
            compact ? "px-[8px] py-[4px]" : "px-[10px] py-[7px]"
          }`}
          style={{
            background: "var(--bg2)",
            borderColor: myEntry ? "var(--red-dim)" : "var(--border)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={subCategory + (myEntry ? `ranked-${myEntry.rank}` : "unranked") + (isSignedIn ? "auth" : "anon")}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex items-center justify-between min-w-0"
            >
              {!isLoaded ? (
                <span className="text-[10px]" style={{ color: "var(--text3)" }}>
                  checking operator session…
                </span>
              ) : isSignedIn && user ? (
                myEntry ? (
                  <div className="flex items-center justify-between w-full text-[11px] gap-[8px]">
                    <div className="flex items-center gap-[6px] min-w-0">
                      <Trophy size={11} style={{ color: "var(--amber)" }} />
                      <span className="truncate" style={{ color: "var(--text2)" }}>
                        @{myEntry.username}
                      </span>
                      <span
                        className="text-[8px] px-[4px] py-[0px] border truncate max-w-[110px]"
                        style={{
                          borderColor: "var(--border2)",
                          color: "var(--text3)",
                          background: "var(--bg1)",
                        }}
                        title={`Record mode: ${myEntry.mode}`}
                      >
                        {myEntry.subLabel || subCategory}
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
                      @{user.username || user.firstName || "operator"} · unranked in {mainCategory}:{subCategory}
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Competitive Mode & Sub-category Selector (Time, Word, Quote - 3 sub-modes each) */}
        <div
          className="flex items-center justify-between px-[2px] pb-[4px] border-b text-[9px] uppercase tracking-[0.5px]"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Main 3 Categories */}
          <div className="flex items-center gap-[3px]">
            <span style={{ color: "var(--text3)", marginRight: "1px" }}>mode:</span>
            {LEADERBOARD_CATEGORIES.map((cat) => {
              const active = mainCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setMainCategory(cat);
                    setSubCategory(DEFAULT_SUB[cat]);
                    setOffset(0);
                  }}
                  className="px-[6px] py-[1.5px] border font-bold transition-all duration-150 cursor-pointer select-none"
                  style={{
                    borderColor: active ? "var(--red)" : "var(--border2)",
                    background: active ? "var(--red-mute)" : "transparent",
                    color: active ? "var(--red-ember)" : "var(--text3)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sub 3 Categories */}
          <div className="flex items-center gap-[2px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mainCategory}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-[2px]"
              >
                {SUB_CATEGORIES[mainCategory].map((sub) => {
                  const active = subCategory === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setSubCategory(sub.id);
                        setOffset(0);
                      }}
                      className="px-[5px] py-[1px] border text-[8px] transition-all duration-150 cursor-pointer select-none"
                      style={{
                        borderColor: active ? "var(--amber-dim)" : "var(--border2)",
                        background: active ? "var(--amber-warm-dim)" : "transparent",
                        color: active ? "var(--amber)" : "var(--text3)",
                      }}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Column Header */}
        <div
          className="grid grid-cols-[34px_1fr_48px_58px] items-center px-[6px] pb-[3px] border-b text-[9px] uppercase tracking-[0.8px]"
          style={{ color: "var(--text3)", borderColor: "var(--border)" }}
        >
          <span>rnk</span>
          <span>operator / mode</span>
          <span className="text-right">acc</span>
          <span className="text-right">speed</span>
        </div>

        {/* Ranked Rows Container with Wheel Pagination */}
        <div
          className="flex-1 overflow-hidden flex flex-col justify-start min-h-0 relative select-none"
          style={{ minHeight: `${listHeight}px` }}
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
          {loading && entries.length === 0 ? (
            <div
              className="flex flex-col divide-y divide-[var(--border)]"
              style={{ minHeight: `${listHeight}px` }}
            >
              {[...Array(visibleRows)].map((_, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[34px_1fr_48px_58px] items-center px-[6px] animate-pulse opacity-40 ${
                    compact ? "h-[38px]" : "h-[46px]"
                  }`}
                  style={{
                    background: "var(--bg2)",
                  }}
                >
                  <div className="w-[18px] h-[10px] bg-[var(--border2)] rounded-[1px]" />
                  <div className="flex flex-col gap-[3px]">
                    <div className="w-[72px] h-[10px] bg-[var(--border2)] rounded-[1px]" />
                    <div className="w-[44px] h-[8px] bg-[var(--border2)] rounded-[1px]" />
                  </div>
                  <div className="w-[28px] h-[10px] bg-[var(--border2)] rounded-[1px] ml-auto" />
                  <div className="w-[36px] h-[12px] bg-[var(--border2)] rounded-[1px] ml-auto" />
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div
              className={`border border-dashed flex flex-col items-center justify-center text-center my-auto ${
                compact ? "py-[14px] px-[8px] gap-[4px]" : "py-[24px] px-[12px] gap-[6px]"
              }`}
              style={{
                borderColor: "var(--border2)",
                background: "var(--bg)",
                minHeight: `${listHeight}px`,
              }}
            >
              <Trophy size={compact ? 13 : 16} style={{ color: "var(--text3)" }} />
              <p className="text-[11px]" style={{ color: "var(--text2)" }}>
                No records in {mainCategory} · {subCategory}
              </p>
              <p className="text-[9px]" style={{ color: "var(--text3)" }}>
                Complete a test {hideFooter ? "below" : "in 3:term"} to rank
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleEntries.map((entry) => {
                const isMe = Boolean(user && entry.userId === user.id);
                const rankColor =
                  entry.rank === 1
                    ? "var(--red-ember)"
                    : entry.rank === 2
                      ? "var(--amber)"
                      : entry.rank === 3
                        ? "var(--green)"
                        : "var(--text3)";

                const modeStyles =
                  mainCategory === "time"
                    ? {
                        color: "var(--amber)",
                        borderColor: "rgba(230, 145, 56, 0.35)",
                        background: "rgba(230, 145, 56, 0.08)",
                      }
                    : mainCategory === "word"
                      ? {
                          color: "var(--green)",
                          borderColor: "rgba(56, 175, 100, 0.35)",
                          background: "rgba(56, 175, 100, 0.08)",
                        }
                      : {
                          color: "var(--red-ember)",
                          borderColor: "rgba(225, 29, 46, 0.35)",
                          background: "rgba(225, 29, 46, 0.08)",
                        };

                return (
                  <motion.div
                    key={entry.id}
                    layout="position"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`grid grid-cols-[34px_1fr_48px_58px] items-center px-[6px] border-b transition-colors hover:bg-[var(--red-hover-tint)] ${
                      compact ? "h-[38px]" : "h-[46px]"
                    }`}
                    style={{
                      borderColor: "var(--border)",
                      background: isMe ? "var(--bg2)" : "transparent",
                    }}
                  >
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: rankColor }}
                    >
                      #{String(entry.rank).padStart(2, "0")}
                    </span>

                    <div className="flex flex-col min-w-0 pr-[4px]">
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
                      <div className="flex items-center gap-[4px] mt-[1px]">
                        <span
                          className="text-[8px] px-[4px] py-[0px] border truncate max-w-[125px] tracking-[0.2px] select-none"
                          style={{
                            ...modeStyles,
                            fontFamily: "var(--mono)",
                          }}
                          title={`Mode: ${entry.mode} · Raw: ${entry.rawWpm} WPM · Consistency: ${entry.consistency}%`}
                        >
                          {entry.subLabel || subCategory}
                        </span>
                      </div>
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
                        WPM
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer info strip */}
        {!hideFooter && (
          <div
            className="flex items-center justify-between pt-[4px] border-t text-[10px]"
            style={{ color: "var(--text3)", borderColor: "var(--border)" }}
          >
            <span>wheel or click to scroll</span>
            <button
              type="button"
              onClick={() => router.push("/term")}
              className="hover:text-[var(--red-ember)] transition-colors cursor-pointer"
              style={{ color: "var(--red)" }}
            >
              open test [3:term] →
            </button>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
