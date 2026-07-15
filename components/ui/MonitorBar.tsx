"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TABS = [
  { num: "1", label: "home", href: "/home" },
  { num: "2", label: "work", href: "/work" },
  { num: "3", label: "journal", action: "open-journal" },
  { num: "4", label: "term", href: "/term" },
  { num: "5", label: "signal", href: "/signal" },
];

export default function MonitorBar() {
  const pathname = usePathname();
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  useEffect(() => {
    const handleJournalState = (e: Event) => setIsJournalOpen((e as CustomEvent).detail);
    document.addEventListener("journal-state", handleJournalState);
    return () => document.removeEventListener("journal-state", handleJournalState);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-[16px] h-[36px] border-b sticky top-0 z-50 flex-shrink-0"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg1)",
      }}
    >
      {/* ── Left ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-[12px] flex-1">
        {/* Brand */}
        <div className="flex items-center gap-[8px]">
          <span
            className="flex-shrink-0"
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              background: "var(--red)",
              clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
              boxShadow: "0 0 12px var(--red-ember)",
            }}
          />
          <span
            className="hidden sm:block text-[13px] font-bold tracking-[0.08em]"
            style={{ color: "var(--red)" }}
          >
            zaevo
          </span>
        </div>

        {/* Separator */}
        <span className="hidden sm:block text-[13px]" style={{ color: "var(--border2)" }}>
          │
        </span>

        {/* Workspace tabs */}
        <nav className="flex gap-[4px]">
          {TABS.map(({ num, label, href, action }) => {
            if (action) {
              const active = isJournalOpen;
              return (
                <button
                  key={label}
                  onClick={() => document.dispatchEvent(new CustomEvent(action))}
                  className="relative text-[13px] px-[6px] sm:px-[10px] py-[4px] rounded-[4px] transition-colors duration-100 tracking-[0.02em] cursor-pointer"
                  style={{ color: active ? "var(--red)" : "var(--text3)", border: "none", background: "none", outline: "none" }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text2)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text3)"; }}
                >
                  {active && (
                    <motion.div
                      layoutId="active-workspace"
                      className="absolute inset-0 rounded-[4px]"
                      style={{ background: "var(--red-mute)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">
                    <span className="hidden sm:inline">{num}:</span>{label}
                  </span>
                </button>
              );
            }

            const active = !isJournalOpen && href && (pathname === href || pathname.startsWith(href as string + "/"));
            return (
              <Link
                key={href}
                href={href as string}
                className="relative text-[13px] px-[6px] sm:px-[10px] py-[4px] rounded-[4px] transition-colors duration-100 tracking-[0.02em]"
                style={{
                  color: active ? "var(--red)" : "var(--text3)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = "var(--text2)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = "var(--text3)";
                }}
              >
                {active && (
                  <motion.div
                    layoutId="active-workspace"
                    className="absolute inset-0 rounded-[4px]"
                    style={{ background: "var(--red-mute)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  <span className="hidden sm:inline">{num}:</span>{label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Right ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-[16px]">
        <span
          className="hidden md:block text-[12px] tracking-[0.1em]"
          style={{ color: "var(--text3)" }}
        >
          OMEN-erde
        </span>
        <Clock />
      </div>
    </header>
  );
}

function Clock() {
  const [clock, setClock] = useState("00:00:00");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="text-[13px] tracking-[0.05em] tabular-nums"
      style={{ color: "var(--text3)" }}
    >
      {clock}
    </span>
  );
}
