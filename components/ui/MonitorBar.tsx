"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import ZaevoLogo from "@/components/ui/ZaevoLogo";

const BASE_TABS = [
  { num: "1", label: "home", href: "/home" },
  { num: "2", label: "journal", href: "/journal" },
  { num: "3", label: "term", href: "/term" },
  { num: "4", label: "signal", href: "/signal" },
];

export default function MonitorBar() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  const tabs =
    isAdmin || pathname.startsWith("/admin")
      ? [...BASE_TABS, { num: "5", label: "admin", href: "/admin" }]
      : BASE_TABS;

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
          <ZaevoLogo size={16} className="flex-shrink-0" />
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
          {tabs.map(({ num, label, href }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
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
      <div className="flex items-center gap-[12px]">
        {isLoaded && (
          <div className="flex items-center gap-[8px]">
            {isSignedIn && user ? (
              <div className="flex items-center gap-[8px]">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex items-center gap-[4px] px-[6px] py-[2px] text-[10px] uppercase tracking-[0.8px] border transition-colors"
                    style={{
                      color: "var(--amber)",
                      borderColor: "var(--amber-dim)",
                      background: "var(--amber-warm-dim)",
                    }}
                    title="Root Admin Workspace"
                  >
                    <Shield size={10} />
                    <span>root</span>
                  </Link>
                )}
                <span
                  className="hidden sm:inline text-[11px]"
                  style={{ color: "var(--text2)" }}
                >
                  @{user.username || user.firstName || "operator"}
                </span>
                <div className="flex items-center scale-75 origin-right">
                  <UserButton />
                </div>
              </div>
            ) : (
              <SignInButton mode="modal" fallbackRedirectUrl="/home">
                <button
                  type="button"
                  className="px-[8px] py-[2px] text-[11px] tracking-[0.5px] border cursor-pointer transition-colors hover:border-[var(--red-dim)] hover:text-[var(--red-ember)]"
                  style={{
                    color: "var(--text2)",
                    borderColor: "var(--border2)",
                    background: "var(--bg2)",
                  }}
                >
                  [auth: login]
                </button>
              </SignInButton>
            )}
            <span
              className="hidden md:inline text-[12px]"
              style={{ color: "var(--border2)" }}
            >
              │
            </span>
          </div>
        )}
        <span
          className="hidden md:block text-[12px] tracking-[0.1em]"
          style={{ color: "var(--text3)" }}
        >
          OMEN-erde
        </span>
        <span className="hidden md:inline text-[12px]" style={{ color: "var(--text3)" }}>&nbsp;&middot;&nbsp;</span>
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
