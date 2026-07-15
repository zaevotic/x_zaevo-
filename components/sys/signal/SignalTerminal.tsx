"use client";

import React, { useState, useEffect } from "react";

const PHRASES = [
  "ABSTRACTIONS MUST EARN THEIR KEEP OR THEY GET DELETED, KABAM",
  "THE BEST TOOLS ARE THE ONES YOU AREN'T AWARE OF",
  "READ THE PAPER AFTER THE THING ALREADY COMPILES",
  "SIGNAL RECEIVED, DECODING IN REAL TIME, STAND BY",
  "THIS TRANSMISSION WILL REPEAT UNTIL SOMEONE ACKNOWLEDGES IT, PLEASE ACKNOWLEDGE IT",
  "TASTE IS THE FORCING FUNCTION FOR GETTING DETAILS RIGHT, AESTHETICS DO MATTER SON",
  "IF YOU DECODED THIS YOU HAVE TOO MUCH FREE TIME",
  "PERFECT IN ISOLATION MEANS SHIPPED TO NOBODY, WHICH IS, SAD",
];

const MORSE_MAP: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  " ": "   ",
};

interface Commit {
  id: string;
  repo: string;
  message: string;
  date: Date;
}

export default function SignalTerminal() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(true);

  useEffect(() => {
    fetch("/api/sys/github")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.error && Array.isArray(payload.commits)) {
          setCommits(
            payload.commits.map((c: Commit) => ({
              ...c,
              date: new Date(c.date),
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCommits(false));
  }, []);

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Decorative Matrix/Scanline Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--red-ember) 1px, transparent 1px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Scrollable content wrapper */}
      <div className="relative z-10 flex flex-col px-[16px] pt-[16px] pb-[8px] gap-[20px] h-full overflow-auto">
        {/* ── BROADCAST (Morse) ───────────────────────── */}
        <div className="flex flex-col gap-[12px]">
          <div
            className="text-[10px] tracking-[1px] uppercase mb-[4px] flex justify-between"
            style={{ color: "var(--text3)" }}
          >
            <span>
              STATUS:{" "}
              <span
                style={{
                  color: "var(--red)",
                  textShadow: "0 0 8px var(--red-mute)",
                }}
              >
                BROADCASTING
              </span>
            </span>
            <span>FREQ: 144.800 MHz</span>
          </div>

          <MorseDisplay />
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: "var(--border2)" }} />

        {/* ── PGP FINGERPRINT ─────────────────────────── */}
        <div className="flex flex-col gap-[8px]">
          <div
            className="text-[10px] tracking-[1px] uppercase flex justify-between items-center w-full"
            style={{ color: "var(--text3)" }}
          >
            <span>[ FINGERPRINT ]</span>
            <span
              className="lowercase tracking-normal italic text-[9px]"
              style={{ color: "var(--text2)" }}
            >
              // just for aesthetics... for now.
            </span>
          </div>
          <div
            className="font-mono text-[11px] p-[10px] border leading-[1.6]"
            style={{
              borderColor: "var(--border2)",
              background: "var(--bg1)",
              color: "var(--amber)",
              textShadow: "0 0 4px rgba(196,124,46,0.3)",
              wordBreak: "break-all",
            }}
          >
            pub ed25519 2026-07-14 [SC] [expires: 2028-07-14]
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7A9F 8B2C 4D1E 6F3A 9C0B 2D5E
            8F1A 4C7B 9E2D 3F6A
            <br />
            uid [ultimate] zaevo &lt;serpmillers@proton.me&gt;
          </div>
        </div>

        {/* ── DIRECT CONNECT ──────────────────────────── */}
        <div className="flex flex-col gap-[8px]">
          <div
            className="text-[10px] tracking-[1px] uppercase flex justify-between items-center w-full"
            style={{ color: "var(--text3)" }}
          >
            <span>[ DIRECT CONNECT ]</span>
            <span
              className="lowercase tracking-normal italic text-[9px]"
              style={{ color: "var(--text2)" }}
            >
              // just for aesthetics... for now.
            </span>
          </div>
          <div className="font-mono text-[11px] flex gap-[8px]">
            <span style={{ color: "var(--text3)" }}>$</span>
            <span style={{ color: "var(--text)" }}>
              curl -s https://zaevo.me/pubkey
            </span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: "var(--border2)" }} />

        {/* ── RECENT FLASHES (Commits) ────────────────── */}
        <div className="flex flex-col gap-[8px]">
          <div
            className="text-[10px] tracking-[1px] uppercase flex items-center justify-between"
            style={{ color: "var(--text3)" }}
          >
            <span>[ RECENT FLASHES ]</span>
            {loadingCommits && (
              <span className="animate-pulse" style={{ color: "var(--amber)" }}>
                Fetching...
              </span>
            )}
          </div>
          <div className="flex flex-col gap-[6px]">
            {commits.length > 0 ? (
              commits.map((c, i) => {
                const timeStr = c.date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
                return (
                  <div
                    key={i}
                    className="flex gap-[10px] text-[11px] font-mono leading-[1.6]"
                  >
                    <span style={{ color: "var(--text3)", flexShrink: 0 }}>
                      {timeStr}
                    </span>
                    <span
                      style={{ color: "var(--red)", flexShrink: 0, width: 75 }}
                      className="truncate"
                      title={c.repo}
                    >
                      {c.repo}
                    </span>
                    <span
                      style={{ color: "var(--text2)" }}
                      className="truncate"
                      title={c.message}
                    >
                      {c.message}
                    </span>
                  </div>
                );
              })
            ) : !loadingCommits ? (
              <div
                className="text-[11px] font-mono"
                style={{ color: "var(--text3)" }}
              >
                No recent flashes found.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MorseDisplay() {
  const [index, setIndex] = useState(0);
  const [displayedMorse, setDisplayedMorse] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let currentPhrase = PHRASES[index];
    let morseArray = currentPhrase
      .split("")
      .map((char) => MORSE_MAP[char.toUpperCase()] || char);

    let charIdx = 0;

    setDisplayedText("");
    setDisplayedMorse("");

    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (charIdx < currentPhrase.length) {
          setDisplayedText(currentPhrase.substring(0, charIdx + 1));
          setDisplayedMorse(morseArray.slice(0, charIdx + 1).join(" "));
          charIdx++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIndex((i) => (i + 1) % PHRASES.length);
          }, 4000);
        }
      }, 90);

      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(startTimeout);
  }, [index]);

  useEffect(() => {
    const blink = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(blink);
  }, []);

  return (
    <div className="flex flex-col gap-[8px] min-h-[60px]">
      <div
        className="font-mono text-[14px] leading-[1.6] break-words"
        style={{
          color: "var(--red)",
          textShadow: "0 0 10px rgba(182,24,43,0.4)",
          letterSpacing: "0.05em",
        }}
      >
        {displayedMorse}
        <span style={{ opacity: cursorVisible ? 1 : 0 }}>_</span>
      </div>
      <div
        className="text-[10px] tracking-[0.25em] uppercase font-mono"
        style={{ color: "var(--text2)" }}
      >
        {displayedText}
      </div>
    </div>
  );
}
