import React from "react";

// ── TermLine ──────────────────────────────────────────────────────────────────
interface TermLineProps {
  user?: string;
  host?: string;
  cwd?: string;
  cmd?: string;
}

export function TermLine({
  user = "zaevo",
  host = "OMEN-erde",
  cwd = "~",
  cmd,
}: TermLineProps) {
  return (
    <div
      className="text-[12px] mb-[5px] leading-[1.7]"
      style={{ fontFamily: "var(--mono)" }}
    >
      <span style={{ color: "var(--red-ember)" }}>{user}</span>
      <span style={{ color: "var(--text2)" }}>
        @{host} {cwd} $
      </span>
      {cmd && <span style={{ color: "var(--text)" }}> {cmd}</span>}
    </div>
  );
}

// ── TermOut ───────────────────────────────────────────────────────────────────
interface TermOutProps {
  children: React.ReactNode;
}

export function TermOut({ children }: TermOutProps) {
  return (
    <div
      className="text-[12px] mb-[12px] leading-[1.7]"
      style={{ color: "var(--text2)", fontFamily: "var(--mono)" }}
    >
      {children}
    </div>
  );
}

// ── TermKv ────────────────────────────────────────────────────────────────────
interface TermKvProps {
  k: string;
  v: string;
}

export function TermKv({ k, v }: TermKvProps) {
  return (
    <div className="text-[11px]">
      <span className="inline-block w-[80px]" style={{ color: "var(--text3)" }}>
        {k}
      </span>
      <span style={{ color: "var(--text2)" }}>{v}</span>
    </div>
  );
}

// ── LogLine ───────────────────────────────────────────────────────────────────
interface LogLineProps {
  time: string;
  tag: string;
  message: string;
}

export function LogLine({ time, tag, message }: LogLineProps) {
  return (
    <div className="text-[11px] mb-[5px]" style={{ color: "var(--text2)" }}>
      {time}
      <span className="mx-[8px]" style={{ color: "var(--red-ember)" }}>
        {tag}
      </span>
      {message}
    </div>
  );
}
