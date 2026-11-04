"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  Shield,
  Lock,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  FileText,
  Trophy,
  Activity,
  Eye,
  Edit3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import type { LeaderboardEntry } from "@/components/sys/log/leaderboard";

interface AdminJournalEntry {
  id: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  callout: string | null;
  body: string;
}

export default function AdminWorkspacePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  // ── Telemetry & Visits state ───────────────────────────────────────────────
  const [visitCount, setVisitCount] = useState<number>(0);
  const [visitInput, setVisitInput] = useState<string>("0");
  const [dbStatus, setDbStatus] = useState<string>("CHECKING");
  const [savingVisits, setSavingVisits] = useState(false);

  // ── Leaderboard state ──────────────────────────────────────────────────────
  const [ranks, setRanks] = useState<LeaderboardEntry[]>([]);
  const [loadingRanks, setLoadingRanks] = useState(true);
  const [confirmPurgeAll, setConfirmPurgeAll] = useState(false);

  // ── Journal CRUD state ─────────────────────────────────────────────────────
  const [posts, setPosts] = useState<AdminJournalEntry[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tagsInput, setTagsInput] = useState("SYSTEMS, LINUX");
  const [excerpt, setExcerpt] = useState("");
  const [callout, setCallout] = useState("");
  const [body, setBody] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  const notify = useCallback((type: "ok" | "err", msg: string) => {
    setStatusBanner({ type, msg });
    setTimeout(() => {
      setStatusBanner(null);
    }, 3500);
  }, []);

  const loadAllAdminData = useCallback(() => {
    setLoadingRanks(true);
    setLoadingPosts(true);

    fetch("/api/visits")
      .then((r) => r.json())
      .then((d) => {
        const c = typeof d?.count === "number" ? d.count : 0;
        setVisitCount(c);
        setVisitInput(String(c));
        setDbStatus(d?.dbStatus ?? "ONLINE");
      })
      .catch(() => setDbStatus("OFFLINE"));

    fetch("/api/usr/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.entries)) {
          setRanks(d.entries);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRanks(false));

    fetch("/api/usr/journal")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setPosts(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isAdmin) return;
    const id = setTimeout(() => {
      loadAllAdminData();
    }, 0);
    return () => clearTimeout(id);
  }, [isLoaded, isSignedIn, isAdmin, loadAllAdminData]);

  const selectPostForEdit = (post: AdminJournalEntry) => {
    setSelectedSlug(post.id);
    setTitle(post.title);
    setSlug(post.id);
    setDate(post.date || new Date().toISOString().slice(0, 10));
    setTagsInput((post.tags ?? []).join(", "));
    setExcerpt(post.excerpt || "");
    setCallout(post.callout || "");
    setBody(post.body || "");
    setPreviewMode(false);
  };

  const resetEditorForNew = () => {
    setSelectedSlug(null);
    setTitle("");
    setSlug("");
    setDate(new Date().toISOString().slice(0, 10));
    setTagsInput("SYSTEMS");
    setExcerpt("");
    setCallout("");
    setBody("## Overview\n\nWrite your journal entry here...");
    setPreviewMode(false);
  };

  const handleSaveVisits = async (nextVal: number) => {
    setSavingVisits(true);
    try {
      const res = await fetch("/api/visits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: nextVal }),
      });
      const data = await res.json();
      if (res.ok && typeof data.count === "number") {
        setVisitCount(data.count);
        setVisitInput(String(data.count));
        notify("ok", `visits counter updated to ${data.count}`);
      } else {
        notify("err", data.error || "failed to update visits");
      }
    } catch {
      notify("err", "network error updating visits");
    } finally {
      setSavingVisits(false);
    }
  };

  const handleDeleteRank = async (id: number) => {
    try {
      const res = await fetch(`/api/usr/leaderboard?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.entries)) {
        setRanks(data.entries);
        notify("ok", `removed leaderboard entry #${id}`);
      } else {
        notify("err", data.error || "failed to delete score");
      }
    } catch {
      notify("err", "network error deleting score");
    }
  };

  const handlePurgeLeaderboard = async () => {
    try {
      const res = await fetch("/api/usr/leaderboard?all=true", {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setRanks(data.entries ?? []);
        setConfirmPurgeAll(false);
        notify("ok", "purged all leaderboard scores");
      } else {
        notify("err", data.error || "failed to purge leaderboard");
      }
    } catch {
      notify("err", "network error purging leaderboard");
    }
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      notify("err", "journal title is required");
      return;
    }
    setSavingPost(true);
    try {
      const res = await fetch("/api/usr/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: slug.trim() || title.trim(),
          title: title.trim(),
          date: date.trim(),
          tags: tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          excerpt: excerpt.trim(),
          callout: callout.trim() || null,
          body,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.posts)) {
        setPosts(data.posts);
        setSelectedSlug(data.id);
        setSlug(data.id);
        notify("ok", `saved journal entry '${data.id}.md'`);
      } else {
        notify("err", data.error || "failed to save journal entry");
      }
    } catch {
      notify("err", "network error saving journal entry");
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    try {
      const res = await fetch(
        `/api/usr/journal?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.posts)) {
        setPosts(data.posts);
        if (selectedSlug === id) {
          resetEditorForNew();
        }
        notify("ok", `deleted '${id}.md'`);
      } else {
        notify("err", data.error || "failed to delete journal entry");
      }
    } catch {
      notify("err", "network error deleting journal entry");
    }
  };

  // ── 1. Loading Session State ───────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-88px)] flex items-center justify-center">
        <Panel className="w-full max-w-[460px]">
          <PanelHead meta="pam_clerk.so · auth">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              SUDO_AUTH
            </b>
          </PanelHead>
          <PanelBody className="py-[32px] text-center">
            <p className="text-[12px]" style={{ color: "var(--text2)" }}>
              verifying session credentials via clerk…
            </p>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  // ── 2. Unauthenticated State ───────────────────────────────────────────────
  if (!isSignedIn || !user) {
    return (
      <div className="h-[calc(100vh-88px)] flex items-center justify-center">
        <Panel className="w-full max-w-[500px]">
          <PanelHead meta="pam_clerk.so · 401">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              SUDO_LOGIN
            </b>
          </PanelHead>
          <PanelBody className="flex flex-col gap-[16px] p-[20px]">
            <div className="flex items-center gap-[10px]">
              <Lock size={18} style={{ color: "var(--red-ember)" }} />
              <div>
                <h2
                  className="text-[15px] font-bold uppercase tracking-[1px]"
                  style={{ color: "var(--text)" }}
                >
                  AUTHENTICATION REQUIRED
                </h2>
                <p className="text-[11px]" style={{ color: "var(--text3)" }}>
                  /admin is restricted to root operators with Clerk session
                </p>
              </div>
            </div>

            <div
              className="p-[12px] border text-[11px] leading-[1.7]"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text2)",
              }}
            >
              <p style={{ color: "var(--red-ember)" }}>
                $ sudo systemctl start zaevo-admin.service
              </p>
              <p>[sudo] password for guest: permission denied (no session)</p>
            </div>

            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full py-[9px] px-[14px] text-[11px] font-bold uppercase tracking-[1px] border cursor-pointer transition-colors"
                style={{
                  background: "var(--red-mute)",
                  borderColor: "var(--red)",
                  color: "var(--red-ember)",
                }}
              >
                [authenticate with clerk →]
              </button>
            </SignInButton>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  // ── 3. Authenticated but Non-Admin Role (`publicMetadata.role !== 'admin'`) ─
  if (!isAdmin) {
    return (
      <div className="h-[calc(100vh-88px)] flex items-center justify-center">
        <Panel className="w-full max-w-[580px]">
          <PanelHead meta="sudoers · EACCES (403)">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              SUDOERS_DENIED
            </b>
          </PanelHead>
          <PanelBody className="flex flex-col gap-[14px] p-[20px]">
            <div className="flex items-center gap-[10px]">
              <AlertTriangle size={18} style={{ color: "var(--amber)" }} />
              <div>
                <h2
                  className="text-[15px] font-bold uppercase tracking-[1px]"
                  style={{ color: "var(--text)" }}
                >
                  USER NOT IN SUDOERS FILE
                </h2>
                <p className="text-[11px]" style={{ color: "var(--text3)" }}>
                  operator @{user.username || user.firstName || "user"} lacks{" "}
                  <code style={{ color: "var(--amber)" }}>
                    publicMetadata.role === &quot;admin&quot;
                  </code>
                </p>
              </div>
            </div>

            <div
              className="p-[12px] border text-[11px] leading-[1.7] flex flex-col gap-[6px]"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text2)",
              }}
            >
              <div>
                <span style={{ color: "var(--text3)" }}>clerk_user_id: </span>
                <span style={{ color: "var(--text)" }}>{user.id}</span>
              </div>
              <div>
                <span style={{ color: "var(--text3)" }}>current_role: </span>
                <span style={{ color: "var(--amber)" }}>
                  {String(
                    (user.publicMetadata as { role?: string } | undefined)
                      ?.role ?? "none",
                  )}
                </span>
              </div>
              <div
                className="pt-[6px] mt-[4px] border-t text-[10px]"
                style={{ borderColor: "var(--border)", color: "var(--text3)" }}
              >
                To grant root access: open Clerk Dashboard → Users → select your
                account → Public Metadata → set:
                <pre
                  className="mt-[6px] p-[8px] border text-[11px]"
                  style={{
                    background: "var(--bg1)",
                    borderColor: "var(--border2)",
                    color: "var(--green)",
                  }}
                >
                  {`{\n  "role": "admin"\n}`}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between gap-[8px]">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-[12px] py-[6px] text-[10px] uppercase tracking-[1px] border cursor-pointer"
                style={{
                  background: "var(--bg2)",
                  borderColor: "var(--border2)",
                  color: "var(--text)",
                }}
              >
                [reload session]
              </button>
              <SignOutButton>
                <button
                  type="button"
                  className="px-[12px] py-[6px] text-[10px] uppercase tracking-[1px] border cursor-pointer"
                  style={{
                    background: "var(--red-mute)",
                    borderColor: "var(--red-dim)",
                    color: "var(--red-ember)",
                  }}
                >
                  [sign out]
                </button>
              </SignOutButton>
            </div>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  // ── 4. Root Admin Workspace Dashboard ──────────────────────────────────────
  const topWpm = ranks.length > 0 ? ranks[0].wpm : 0;

  return (
    <div className="grid gap-[10px] grid-cols-1 xl:grid-cols-[1.15fr_1.85fr] xl:h-[calc(100vh-88px)]">
      {/* ── LEFT COLUMN: SYSTEM TELEMETRY + LEADERBOARD MODERATION ─────────── */}
      <div className="flex flex-col gap-[10px] min-h-0">
        {/* Panel 1: System & Visitor Telemetry */}
        <Panel delay={0.1}>
          <PanelHead
            meta={
              <div className="flex items-center gap-[8px]">
                <span>sys.stat · turso.db</span>
                <button
                  type="button"
                  onClick={loadAllAdminData}
                  className="p-[2px] cursor-pointer hover:text-[var(--red-ember)]"
                  style={{
                    color: "var(--text3)",
                    background: "none",
                    border: "none",
                  }}
                  title="Sync all admin telemetry"
                >
                  <RefreshCw size={11} />
                </button>
              </div>
            }
          >
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              SYSTEM_TELEMETRY
            </b>
          </PanelHead>
          <PanelBody className="flex flex-col gap-[10px]">
            {statusBanner && (
              <div
                className="px-[10px] py-[6px] border flex items-center gap-[8px] text-[11px]"
                style={{
                  background: "var(--bg2)",
                  borderColor:
                    statusBanner.type === "ok"
                      ? "var(--green-dim)"
                      : "var(--red-dim)",
                  color:
                    statusBanner.type === "ok"
                      ? "var(--green)"
                      : "var(--red-ember)",
                }}
              >
                <CheckCircle2 size={12} />
                <span>{statusBanner.msg}</span>
              </div>
            )}

            {/* 4-Card Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-[8px]">
              <div
                className="p-[8px] border flex flex-col"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  turso db
                </span>
                <span
                  className="text-[14px] font-bold mt-[2px]"
                  style={{
                    color:
                      dbStatus === "ONLINE"
                        ? "var(--green)"
                        : "var(--amber)",
                  }}
                >
                  ● {dbStatus}
                </span>
              </div>

              <div
                className="p-[8px] border flex flex-col"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  total visits
                </span>
                <span
                  className="text-[15px] font-bold mt-[2px]"
                  style={{ color: "var(--text)" }}
                >
                  {visitCount}
                </span>
              </div>

              <div
                className="p-[8px] border flex flex-col"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  ranked ops
                </span>
                <span
                  className="text-[15px] font-bold mt-[2px]"
                  style={{ color: "var(--red-ember)" }}
                >
                  {ranks.length}{" "}
                  <span
                    className="text-[10px] font-normal"
                    style={{ color: "var(--text3)" }}
                  >
                    (top {topWpm})
                  </span>
                </span>
              </div>

              <div
                className="p-[8px] border flex flex-col"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  journal.md
                </span>
                <span
                  className="text-[15px] font-bold mt-[2px]"
                  style={{ color: "var(--amber)" }}
                >
                  {posts.length}
                </span>
              </div>
            </div>

            {/* Visitor Counter Override Row */}
            <div
              className="px-[10px] py-[8px] border flex flex-wrap items-center justify-between gap-[8px]"
              style={{
                background: "var(--bg2)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-[6px] text-[11px]">
                <Activity size={12} style={{ color: "var(--red)" }} />
                <span style={{ color: "var(--text2)" }}>visits.count:</span>
              </div>
              <div className="flex items-center gap-[6px]">
                <input
                  type="number"
                  value={visitInput}
                  onChange={(e) => setVisitInput(e.target.value)}
                  className="w-[84px] px-[7px] py-[3px] text-[11px] border outline-none"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border2)",
                    color: "var(--text)",
                  }}
                />
                <button
                  type="button"
                  disabled={savingVisits}
                  onClick={() => handleSaveVisits(Number(visitInput) || 0)}
                  className="px-[8px] py-[3px] text-[10px] uppercase border cursor-pointer transition-colors hover:border-[var(--red-dim)]"
                  style={{
                    background: "var(--bg1)",
                    borderColor: "var(--border2)",
                    color: "var(--text)",
                  }}
                >
                  [set]
                </button>
                <button
                  type="button"
                  disabled={savingVisits}
                  onClick={() => handleSaveVisits(0)}
                  className="px-[8px] py-[3px] text-[10px] uppercase border cursor-pointer transition-colors"
                  style={{
                    background: "var(--red-mute)",
                    borderColor: "var(--red-dim)",
                    color: "var(--red-ember)",
                  }}
                >
                  [zero]
                </button>
              </div>
            </div>

            {/* Operator Identity Footer */}
            <div
              className="flex items-center justify-between text-[10px] px-[2px]"
              style={{ color: "var(--text3)" }}
            >
              <span className="flex items-center gap-[5px]">
                <Shield size={11} style={{ color: "var(--green)" }} />
                <span>
                  root:{" "}
                  <b style={{ color: "var(--text2)" }}>
                    @{user.username || user.firstName || "admin"}
                  </b>
                </span>
              </span>
              <span>uid: {user.id.slice(0, 14)}…</span>
            </div>
          </PanelBody>
        </Panel>

        {/* Panel 2: Leaderboard Moderation */}
        <Panel delay={0.2} className="flex-1 min-h-0 flex flex-col">
          <PanelHead
            meta={
              <div className="flex items-center gap-[8px]">
                <span>{ranks.length} rows · ranks.db</span>
                {ranks.length > 0 &&
                  (!confirmPurgeAll ? (
                    <button
                      type="button"
                      onClick={() => setConfirmPurgeAll(true)}
                      className="text-[10px] px-[6px] py-[1px] border cursor-pointer"
                      style={{
                        color: "var(--red-ember)",
                        borderColor: "var(--red-dim)",
                        background: "var(--red-mute)",
                      }}
                    >
                      [purge all]
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-[4px]">
                      <button
                        type="button"
                        onClick={handlePurgeLeaderboard}
                        className="text-[10px] px-[6px] py-[1px] border cursor-pointer"
                        style={{
                          color: "var(--bg)",
                          background: "var(--red-ember)",
                          borderColor: "var(--red-ember)",
                        }}
                      >
                        confirm!
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmPurgeAll(false)}
                        className="text-[10px] px-[5px] py-[1px] border cursor-pointer"
                        style={{
                          color: "var(--text3)",
                          borderColor: "var(--border)",
                        }}
                      >
                        cancel
                      </button>
                    </span>
                  ))}
              </div>
            }
          >
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              LEADERBOARD_MOD
            </b>
          </PanelHead>
          <PanelBody className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div
              className="grid grid-cols-[36px_1fr_56px_54px_38px] items-center px-[6px] pb-[6px] border-b text-[9px] uppercase tracking-[0.8px]"
              style={{ color: "var(--text3)", borderColor: "var(--border)" }}
            >
              <span>rnk</span>
              <span>operator / mode</span>
              <span className="text-right">wpm</span>
              <span className="text-right">acc</span>
              <span className="text-right">act</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
              {loadingRanks ? (
                <div className="py-[20px] text-center text-[11px]" style={{ color: "var(--text3)" }}>
                  querying ranks.db…
                </div>
              ) : ranks.length === 0 ? (
                <div className="py-[28px] text-center flex flex-col items-center gap-[6px]">
                  <Trophy size={15} style={{ color: "var(--text3)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text3)" }}>
                    leaderboard table is empty
                  </span>
                </div>
              ) : (
                ranks.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[36px_1fr_56px_54px_38px] items-center py-[7px] px-[6px] text-[11px] hover:bg-[var(--red-hover-tint)]"
                  >
                    <span
                      className="font-bold"
                      style={{
                        color:
                          r.rank === 1
                            ? "var(--red-ember)"
                            : r.rank === 2
                              ? "var(--amber)"
                              : "var(--text3)",
                      }}
                    >
                      #{String(r.rank).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 pr-[6px]">
                      <div
                        className="truncate text-[12px]"
                        style={{ color: "var(--text)" }}
                      >
                        @{r.username}
                      </div>
                      <div
                        className="truncate text-[9px]"
                        style={{ color: "var(--text3)" }}
                      >
                        {r.mode} · raw {r.rawWpm}
                      </div>
                    </div>
                    <span
                      className="text-right font-bold"
                      style={{ color: "var(--red-ember)" }}
                    >
                      {r.wpm}
                    </span>
                    <span
                      className="text-right"
                      style={{ color: "var(--green)" }}
                    >
                      {r.accuracy}%
                    </span>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteRank(r.id)}
                        className="p-[4px] border cursor-pointer transition-colors hover:border-[var(--red)] hover:text-[var(--red-ember)]"
                        style={{
                          color: "var(--text3)",
                          borderColor: "var(--border)",
                          background: "var(--bg)",
                        }}
                        title={`Delete score by @${r.username}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PanelBody>
        </Panel>
      </div>

      {/* ── RIGHT COLUMN: JOURNAL MARKDOWN CMS ───────────────────────────── */}
      <Panel delay={0.3} className="min-h-0 flex flex-col">
        <PanelHead
          meta={
            <div className="flex items-center gap-[8px]">
              <span>app/api/usr/journal/journals/*.md</span>
              <button
                type="button"
                onClick={resetEditorForNew}
                className="inline-flex items-center gap-[4px] px-[7px] py-[2px] text-[10px] border cursor-pointer transition-colors"
                style={{
                  color: "var(--green)",
                  borderColor: "var(--green-dim)",
                  background: "var(--bg1)",
                }}
              >
                <Plus size={10} />
                <span>new.md</span>
              </button>
            </div>
          }
        >
          <Dagger /> ~/{" "}
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            JOURNAL_CMS
          </b>
        </PanelHead>

        <PanelBody className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-[12px] overflow-hidden">
          {/* Left File Sidebar */}
          <div
            className="border p-[8px] flex flex-col gap-[6px] overflow-y-auto"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <div
              className="text-[9px] uppercase tracking-[1px] pb-[4px] border-b flex items-center justify-between"
              style={{ color: "var(--text3)", borderColor: "var(--border)" }}
            >
              <span>entries ({posts.length})</span>
              <FileText size={10} />
            </div>

            {loadingPosts ? (
              <span className="text-[10px] py-[8px]" style={{ color: "var(--text3)" }}>
                reading journals/…
              </span>
            ) : posts.length === 0 ? (
              <span className="text-[10px] py-[8px]" style={{ color: "var(--text3)" }}>
                no .md files yet
              </span>
            ) : (
              posts.map((post) => {
                const active = selectedSlug === post.id;
                return (
                  <div
                    key={post.id}
                    className="p-[7px] border flex items-start justify-between gap-[6px] transition-colors"
                    style={{
                      background: active ? "var(--red-mute)" : "var(--bg1)",
                      borderColor: active ? "var(--red)" : "var(--border)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => selectPostForEdit(post)}
                      className="text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <div
                        className="text-[11px] font-bold truncate"
                        style={{
                          color: active ? "var(--red-ember)" : "var(--text)",
                        }}
                      >
                        {post.title}
                      </div>
                      <div
                        className="text-[9px] truncate"
                        style={{ color: "var(--text3)" }}
                      >
                        {post.date} · {post.id}.md
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteJournal(post.id)}
                      className="p-[3px] cursor-pointer hover:text-[var(--red-ember)] shrink-0"
                      style={{ color: "var(--text3)" }}
                      title={`Delete ${post.id}.md`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Markdown Editor / Preview Form */}
          <form
            onSubmit={handleSaveJournal}
            className="flex flex-col gap-[8px] min-h-0 overflow-y-auto pr-[2px]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[8px]">
              <div className="sm:col-span-2 flex flex-col gap-[3px]">
                <label
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom Wayland Compositor Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-[9px] py-[5px] text-[12px] border outline-none"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border2)",
                    color: "var(--text)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-[3px]">
                <label
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  date (yyyy-mm-dd)
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-[9px] py-[5px] text-[12px] border outline-none"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border2)",
                    color: "var(--text)",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
              <div className="flex flex-col gap-[3px]">
                <label
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  slug (filename.md)
                </label>
                <input
                  type="text"
                  placeholder="auto-generated from title"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="px-[9px] py-[5px] text-[11px] border outline-none"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text2)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-[3px]">
                <label
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="SYSTEMS, LINUX, RUST"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="px-[9px] py-[5px] text-[11px] border outline-none"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--amber)",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
              <div className="flex flex-col gap-[3px]">
                <label
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  excerpt (summary)
                </label>
                <input
                  type="text"
                  placeholder="Short one-line summary for cards..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="px-[9px] py-[5px] text-[11px] border outline-none"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text2)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-[3px]">
                <label
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  callout (optional header note)
                </label>
                <input
                  type="text"
                  placeholder="Optional callout banner..."
                  value={callout}
                  onChange={(e) => setCallout(e.target.value)}
                  className="px-[9px] py-[5px] text-[11px] border outline-none"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text2)",
                  }}
                />
              </div>
            </div>

            {/* Body Editor / Live Markdown Preview */}
            <div className="flex-1 flex flex-col gap-[4px] min-h-[200px]">
              <div className="flex items-center justify-between">
                <label
                  className="text-[9px] uppercase tracking-[0.8px]"
                  style={{ color: "var(--text3)" }}
                >
                  markdown body
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewMode((p) => !p)}
                  className="inline-flex items-center gap-[4px] px-[7px] py-[2px] text-[10px] border cursor-pointer"
                  style={{
                    color: previewMode ? "var(--amber)" : "var(--text2)",
                    borderColor: "var(--border2)",
                    background: "var(--bg2)",
                  }}
                >
                  {previewMode ? <Edit3 size={10} /> : <Eye size={10} />}
                  <span>{previewMode ? "edit markdown" : "preview"}</span>
                </button>
              </div>

              {previewMode ? (
                <div
                  className="flex-1 p-[12px] border overflow-y-auto text-[13px] leading-[1.7]"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border2)",
                    color: "var(--text2)",
                    fontFamily: "var(--sans)",
                  }}
                >
                  <ReactMarkdown>{body}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write markdown content..."
                  className="flex-1 p-[10px] text-[12px] leading-[1.65] border outline-none resize-none"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border2)",
                    color: "var(--text)",
                    fontFamily: "var(--mono)",
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-[4px]">
              <span className="text-[10px]" style={{ color: "var(--text3)" }}>
                {selectedSlug
                  ? `editing: ${selectedSlug}.md`
                  : "mode: create new markdown entry"}
              </span>
              <button
                type="submit"
                disabled={savingPost}
                className="inline-flex items-center gap-[6px] px-[14px] py-[6px] text-[11px] font-bold uppercase tracking-[1px] border cursor-pointer transition-colors"
                style={{
                  background: "var(--red-mute)",
                  borderColor: "var(--red)",
                  color: "var(--red-ember)",
                }}
              >
                <Save size={12} />
                <span>{savingPost ? "writing…" : "[write to disk →]"}</span>
              </button>
            </div>
          </form>
        </PanelBody>
      </Panel>
    </div>
  );
}

