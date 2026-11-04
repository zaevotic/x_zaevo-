"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Dagger } from "@/components/ui/Panel";
import { Send, CornerDownLeft } from "lucide-react";

interface Echo {
  id: number;
  postSlug: string;
  userId: string;
  username: string;
  provider: string;
  imageUrl?: string | null;
  content: string;
  reaction?: string | null;
  createdAt: string;
}

interface EchoesResponse {
  echoes: Echo[];
  reactions: {
    ACK: number;
    LGTM: number;
    EXEC: number;
    BUG: number;
  };
  total: number;
}

interface Props {
  postSlug: string;
}

const REACTIONS = [
  { key: "ACK", label: "+1 ACK" },
  { key: "LGTM", label: "🔥 LGTM" },
  { key: "EXEC", label: "⚡ EXEC" },
  { key: "BUG", label: "💀 BUG" },
] as const;

export default function JournalEchoes({ postSlug }: Props) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({
    ACK: 0,
    LGTM: 0,
    EXEC: 0,
    BUG: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchEchoes = useCallback(async () => {
    if (!postSlug) return;
    try {
      const res = await fetch(
        `/api/usr/journal/echoes?slug=${encodeURIComponent(postSlug)}`,
      );
      if (res.ok) {
        const data: EchoesResponse = await res.json();
        setEchoes(data.echoes || []);
        setReactions(
          data.reactions || { ACK: 0, LGTM: 0, EXEC: 0, BUG: 0 },
        );
      }
    } catch (err) {
      console.error("Failed to fetch echoes", err);
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!postSlug) return;
      try {
        const res = await fetch(
          `/api/usr/journal/echoes?slug=${encodeURIComponent(postSlug)}`,
        );
        if (!ignore && res.ok) {
          const data: EchoesResponse = await res.json();
          setEchoes(data.echoes || []);
          setReactions(
            data.reactions || { ACK: 0, LGTM: 0, EXEC: 0, BUG: 0 },
          );
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch echoes", err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [postSlug]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSignedIn || submitting) return;

    const trimmed = message.trim();
    if (!trimmed && !selectedReaction) {
      setStatusMessage("ERR: enter a message or select a reaction");
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/usr/journal/echoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          content: trimmed,
          reaction: selectedReaction,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to transmit echo");
      }

      setMessage("");
      setSelectedReaction(null);
      setStatusMessage("OK: echo transmitted to node");
      setTimeout(() => setStatusMessage(null), 3000);
      await fetchEchoes();
    } catch (err: unknown) {
      setStatusMessage(`ERR: ${err instanceof Error ? err.message : "transmit failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickReaction = async (rKey: string) => {
    if (!isSignedIn) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/usr/journal/echoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          content: `[${rKey}]`,
          reaction: rKey,
        }),
      });
      if (res.ok) {
        setStatusMessage(`OK: [${rKey}] logged`);
        setTimeout(() => setStatusMessage(null), 2500);
        await fetchEchoes();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const username =
    user?.username ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "operator";

  const provider = (() => {
    const accs = user?.externalAccounts ?? [];
    for (const a of accs) {
      const p = String(a.provider || "").toLowerCase();
      if (p.includes("github")) return "github";
      if (p.includes("discord")) return "discord";
      if (p.includes("google")) return "google";
    }
    return "clerk";
  })();

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toISOString().slice(0, 16).replace("T", " ");
    } catch {
      return iso.slice(0, 16);
    }
  };

  return (
    <div
      className="mt-[40px] pt-[24px] border-t flex flex-col gap-[16px]"
      style={{
        borderColor: "var(--border)",
        fontFamily: "var(--mono)",
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-[8px]">
        <div className="flex items-center gap-[6px] text-[11px]">
          <Dagger />
          <span style={{ color: "var(--text3)" }}>~/</span>
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            SIGNED_ECHOES
          </b>
          <span
            className="text-[10px] px-[6px] py-[1px] border"
            style={{
              borderColor: "var(--border2)",
              color: "var(--text3)",
              background: "var(--bg1)",
            }}
          >
            echoes.log
          </span>
        </div>
        <div className="text-[10px]" style={{ color: "var(--text3)" }}>
          {loading ? "syncing…" : `${echoes.length} transmits`}
        </div>
      </div>

      {/* Quick Reaction Pills */}
      <div
        className="flex items-center gap-[6px] flex-wrap p-[10px] border"
        style={{
          background: "var(--bg1)",
          borderColor: "var(--border2)",
        }}
      >
        <span
          className="text-[10px] tracking-[1px] uppercase mr-[4px]"
          style={{ color: "var(--text3)" }}
        >
          REACTIONS:
        </span>
        {REACTIONS.map(({ key, label }) => {
          const count = reactions[key] || 0;
          const isSelected = selectedReaction === key;
          return (
            <button
              key={key}
              type="button"
              disabled={submitting}
              onClick={() => {
                if (!isSignedIn) return;
                setSelectedReaction(isSelected ? null : key);
              }}
              onDoubleClick={() => {
                if (isSignedIn) handleQuickReaction(key);
              }}
              title={
                isSignedIn
                  ? "Click to attach to message, double-click to instant-log"
                  : "Sign in to react"
              }
              className="text-[10px] px-[8px] py-[3px] border transition-colors cursor-pointer flex items-center gap-[6px] select-none"
              style={{
                borderColor: isSelected ? "var(--red)" : "var(--border)",
                background: isSelected ? "var(--red-mute)" : "var(--bg)",
                color: isSelected ? "var(--red-ember)" : "var(--text2)",
              }}
            >
              <span>{label}</span>
              <span
                style={{
                  color: isSelected ? "var(--red)" : "var(--text3)",
                  fontWeight: count > 0 ? "bold" : "normal",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Terminal Stream of Echoes */}
      <div
        className="border flex flex-col max-h-[300px] overflow-auto"
        style={{
          background: "var(--bg)",
          borderColor: "var(--border2)",
        }}
      >
        {loading ? (
          <div
            className="p-[14px] text-[11px]"
            style={{ color: "var(--text3)" }}
          >
            {"// reading echoes from node buffer…"}
          </div>
        ) : echoes.length === 0 ? (
          <div
            className="p-[14px] text-[11px]"
            style={{ color: "var(--text3)" }}
          >
            {"// 0 echoes recorded. authenticate and transmit an echo."}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border2)]">
            {echoes.map((echo) => (
              <div
                key={echo.id}
                className="px-[12px] py-[8px] text-[11px] leading-[1.6] flex flex-col sm:flex-row sm:items-baseline gap-[6px] hover:bg-[var(--bg1)] transition-colors"
              >
                <div className="flex items-center gap-[6px] shrink-0">
                  <span
                    className="text-[9px]"
                    style={{ color: "var(--text3)" }}
                  >
                    [{formatTimestamp(echo.createdAt)}]
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--red)" }}
                  >
                    {echo.username}
                  </span>
                  <span style={{ color: "var(--text3)" }}>
                    @{echo.provider}:~$
                  </span>
                </div>

                <div className="flex items-center gap-[6px] flex-wrap break-all flex-1">
                  {echo.reaction && (
                    <span
                      className="text-[9px] px-[5px] py-[0px] border tracking-[0.5px] uppercase font-bold"
                      style={{
                        borderColor: "var(--red)",
                        color: "var(--red-ember)",
                        background: "var(--red-mute)",
                      }}
                    >
                      {echo.reaction}
                    </span>
                  )}
                  <span style={{ color: "var(--text)" }}>{echo.content}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Input or Auth CTA */}
      <div
        className="border p-[10px]"
        style={{
          background: "var(--bg1)",
          borderColor: "var(--border)",
        }}
      >
        {!isLoaded ? (
          <div className="text-[11px]" style={{ color: "var(--text3)" }}>
            syncing credentials…
          </div>
        ) : isSignedIn ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-[8px] flex-wrap">
              <span
                className="text-[11px] font-bold"
                style={{ color: "var(--red)" }}
              >
                {username}@{provider}:~$
              </span>
              {selectedReaction && (
                <span
                  className="text-[9px] px-[5px] py-[1px] border"
                  style={{
                    borderColor: "var(--red)",
                    color: "var(--red-ember)",
                    background: "var(--red-mute)",
                  }}
                >
                  [{selectedReaction}]
                </span>
              )}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={280}
                placeholder="transmit echo… (Enter to submit)"
                className="flex-1 min-w-[200px] bg-transparent border-0 outline-none text-[11px] placeholder:opacity-40"
                style={{
                  color: "var(--text)",
                  fontFamily: "var(--mono)",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-[10px] py-[4px] border text-[10px] tracking-[1px] uppercase font-bold cursor-pointer transition-colors hover:bg-[var(--red)] hover:text-white flex items-center gap-[4px] shrink-0"
                style={{
                  borderColor: "var(--border2)",
                  color: "var(--text)",
                  background: "var(--bg)",
                }}
              >
                {submitting ? (
                  "transmitting…"
                ) : (
                  <>
                    <span>TRANSMIT</span>
                    <Send size={10} />
                  </>
                )}
              </button>
            </div>
            {statusMessage && (
              <div
                className="text-[10px] tracking-[0.5px]"
                style={{
                  color: statusMessage.startsWith("ERR")
                    ? "var(--red)"
                    : "var(--amber)",
                }}
              >
                {statusMessage}
              </div>
            )}
          </form>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-[8px]">
            <div className="flex items-center gap-[6px] text-[11px]">
              <span style={{ color: "var(--text3)" }}>
                guest@node:~$
              </span>
              <span style={{ color: "var(--text2)" }}>
                authentication required to append signed echo
              </span>
            </div>
            <SignInButton
              mode="modal"
              fallbackRedirectUrl={`/journal?entry=${postSlug}`}
            >
              <button
                type="button"
                className="px-[10px] py-[4px] border text-[10px] tracking-[1px] uppercase font-bold cursor-pointer transition-colors hover:bg-[var(--red)] hover:text-white flex items-center gap-[4px]"
                style={{
                  borderColor: "var(--red)",
                  color: "var(--red-ember)",
                  background: "var(--red-mute)",
                }}
              >
                <span>[SIGN IN WITH CLERK]</span>
                <CornerDownLeft size={10} />
              </button>
            </SignInButton>
          </div>
        )}
      </div>
    </div>
  );
}
