"use client";

import Link from "next/link";
import { Cpu, FileCode, Terminal, Star } from "lucide-react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";

const PROJECTS = [
  {
    icon: Cpu,
    name: "za0S",
    desc: "Custom OS architecture with a 3-layer semantic filesystem model, xattr integration, and real x86 implementation planning.",
    stack: ["Rust", "C", "systems"],
    metaIcon: Star,
    metaText: "research",
    href: "/work",
  },
  {
    icon: FileCode,
    name: "svg-readme-gen",
    desc: "Animated SVG GitHub profile that mimics fastfetch/neofetch layout with live GraphQL stats injection and GitHub Actions automation.",
    stack: ["Python", "SVG", "tooling"],
    metaText: "shipped",
    href: "/work",
  },
  {
    icon: Terminal,
    name: "terminal-portfolio",
    desc: "Self-contained terminal portfolio page. Unified filesystem panel, vim-style file viewer tabs, live keyboard panel, floating syslog.",
    stack: ["TypeScript", "Tauri", "web"],
    metaText: "oss",
    href: "/work",
  },
];

export default function FeaturedProjectsPanel({
  delay = 0,
}: {
  delay?: number;
}) {
  return (
    <Panel delay={delay}>
      <PanelHead meta="projects.lst">
        <Dagger /> ~/{" "}
        <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
          FEATURED_PROJECTS
        </b>
      </PanelHead>
      <PanelBody className="flex flex-col gap-[10px]">
        {PROJECTS.map((proj) => (
          <Link
            href={proj.href}
            key={proj.name}
            className="group flex gap-[16px] p-[14px] border transition-all cursor-pointer no-underline bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--bg2)] hover:border-[var(--red-dim)]"
          >
            {/* Icon */}
            <div
              className="flex items-center justify-center w-[44px] h-[44px] border shrink-0 transition-colors group-hover:border-[var(--red-dim)] group-hover:text-[var(--red-ember)]"
              style={{
                borderColor: "var(--border2)",
                background: "var(--bg1)",
                color: "var(--text2)",
              }}
            >
              <proj.icon size={20} strokeWidth={1.5} />
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-start mb-[8px]">
                <h3
                  className="text-[13px] font-bold tracking-[0.5px] transition-colors group-hover:text-[var(--text)]"
                  style={{ color: "var(--text2)", fontFamily: "var(--mono)" }}
                >
                  {proj.name}
                </h3>
                <div
                  className="text-[10px] flex items-center gap-[4px] uppercase tracking-[1px] transition-colors group-hover:text-[var(--amber)]"
                  style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
                >
                  {proj.metaIcon && (
                    <proj.metaIcon size={10} strokeWidth={2.5} />
                  )}
                  {proj.metaText}
                </div>
              </div>
              <p
                className="text-[12px] leading-[1.6] mb-[12px] line-clamp-2"
                style={{ color: "var(--text2)" }}
              >
                {proj.desc}
              </p>
              <div className="flex flex-wrap gap-[8px]">
                {proj.stack.map((s) => (
                  <span
                    key={s}
                    className="text-[9px] px-[8px] py-[3px] border tracking-[0.5px] uppercase transition-colors group-hover:border-[var(--red-dim)] group-hover:text-[var(--red)]"
                    style={{
                      borderColor: "var(--border2)",
                      color: "var(--text3)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </PanelBody>
    </Panel>
  );
}
