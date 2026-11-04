"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { AlertTriangle, Terminal, ArrowLeft } from "lucide-react";
import MonitorBar from "@/components/ui/MonitorBar";
import StatusBar from "@/components/ui/StatusBar";
import ResumeScratchpad from "@/components/ui/ResumeScratchpad";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import ZaevoLogo from "@/components/ui/ZaevoLogo";

const LetterGlitch = dynamic(() => import("@/components/ui/LetterGlitch"), {
  ssr: false,
  loading: () => null,
});

export default function NotFound() {
  const pathname = usePathname() || "/unknown";

  return (
    <div className="h-full flex flex-col relative z-0">
      <LetterGlitch />
      <MonitorBar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-[10px] w-full flex items-center justify-center">
        <Panel delay={0.1} className="w-full max-w-[560px]">
          <PanelHead meta="errno: 2 (ENOENT) · /dev/null">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--red)", letterSpacing: "1px" }}>
              FAULT_404
            </b>
          </PanelHead>

          <PanelBody className="flex flex-col p-[24px] sm:p-[32px]">
            {/* Top Header: Logo + 404 Display */}
            <div className="flex items-center justify-between gap-[16px] pb-[20px] mb-[20px] border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-[16px]">
                <ZaevoLogo size={52} className="shrink-0" />
                <div>
                  <div className="flex items-center gap-[8px] mb-[4px]">
                    <span
                      className="text-[9px] px-[6px] py-[1px] border uppercase tracking-[1px]"
                      style={{
                        color: "var(--amber)",
                        background: "var(--amber-warm-dim)",
                        borderColor: "var(--amber-warm)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      SIGSEGV · 0x00000404
                    </span>
                  </div>
                  <h2
                    className="text-[15px] font-bold tracking-[1.5px] uppercase"
                    style={{ color: "var(--text)", fontFamily: "var(--mono)" }}
                  >
                    ENOENT: Inode Not Found
                  </h2>
                </div>
              </div>

              <h1
                className="text-[48px] sm:text-[64px] leading-none select-none"
                style={{
                  fontFamily: "var(--display)",
                  color: "var(--red)",
                  textShadow: "0 0 24px rgba(255, 36, 54, 0.35)",
                }}
              >
                404
              </h1>
            </div>

            {/* Terminal Trace Log */}
            <div
              className="p-[14px] border mb-[20px] text-[11px] leading-[1.75] overflow-x-auto"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                fontFamily: "var(--mono)",
              }}
            >
              <div>
                <span style={{ color: "var(--red)" }}>zaevo@OMEN-erde</span>
                <span style={{ color: "var(--text3)" }}>:</span>
                <span style={{ color: "var(--amber)" }}>~</span>
                <span style={{ color: "var(--text2)" }}>$ cd {pathname}</span>
              </div>
              <div style={{ color: "var(--red-ember)" }}>
                zsh: cd: no such file or directory: {pathname}
              </div>
              <div style={{ color: "var(--text3)" }}>
                [kernel] vfs_lookup failed at target path (status: -ENOENT)
              </div>
              <div className="flex items-center gap-[6px]" style={{ color: "var(--amber)" }}>
                <AlertTriangle size={11} className="shrink-0" />
                <span>[init] process exited with code 127 — unmounted workspace</span>
              </div>
            </div>

            {/* Explanation */}
            <p
              className="text-[13px] font-sans leading-[1.65] mb-[24px]"
              style={{ color: "var(--text2)" }}
            >
              The requested route or file descriptor does not exist in the current
              filesystem tree, or has been unmounted from the workspace manager.
            </p>

            {/* Navigation Actions */}
            <div
              className="pt-[20px] border-t flex flex-wrap items-center justify-between gap-[12px]"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-[10px]">
                <Link
                  href="/home"
                  className="inline-flex items-center gap-[8px] px-[16px] py-[8px] text-[11px] tracking-[1px] uppercase font-bold border cursor-pointer transition-colors no-underline hover:bg-[var(--red-hover-tint)]"
                  style={{
                    borderColor: "var(--red)",
                    background: "var(--red-mute)",
                    color: "var(--text)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  <ArrowLeft size={12} />
                  [~] cd /home
                </Link>

                <Link
                  href="/term"
                  className="inline-flex items-center gap-[8px] px-[16px] py-[8px] text-[11px] tracking-[1px] uppercase font-bold border cursor-pointer transition-colors no-underline hover:bg-[var(--red-hover-tint)]"
                  style={{
                    borderColor: "var(--border2)",
                    color: "var(--text2)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  <Terminal size={12} />
                  [&gt;] /term
                </Link>
              </div>

              <span
                className="text-[10px] tracking-[1px] uppercase"
                style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
              >
                status: 404_not_found
              </span>
            </div>
          </PanelBody>
        </Panel>
      </main>

      <StatusBar />
      <ResumeScratchpad />
    </div>
  );
}

