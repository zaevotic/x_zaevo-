"use client";

import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import SystemLogPanel from "@/components/ui/SystemLogPanel";
import FeaturedProjectsPanel from "@/components/ui/FeaturedProjectsPanel";
import GithubHeatmap from "@/components/sys/log/github";
import HeroMarquee from "@/components/ui/HeroMarquee";
import LeaderboardPanel from "@/components/sys/log/leaderboard";
import WakaTimePanel from "@/components/sys/log/wakatime_panel";


// Posts will be fetched from the API

// ── Data ──────────────────────────────────────────────────────────────────────

const TECH_STACK = [
  { category: "LANGUAGES", skills: ["C", "C++", "PYTHON"] },
  {
    category: "FRONTEND",
    skills: ["REACT", "TAILWIND", "VANILLA CSS", "VITE"],
  },
  { category: "BACKEND / DATA", skills: ["POSTGRESQL", "SQLITE", "SQL"] },
  {
    category: "ENVIRONMENT",
    skills: ["ARCH LINUX", "HYPRLAND", "NIRI", "NEOVIM", "ZSH", "KITTY"],
  },
  {
    category: "LEARNING",
    skills: ["RUST", "TYPESCRIPT", "JAVASCRIPT", "SHELL", "REDIS", "PRISMA"],
  },

          ];


// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="grid gap-[10px] grid-cols-1 md:grid-cols-[2.2fr_1fr] xl:grid-cols-[3.2fr_1fr]">
      {/* MAIN LEFT COLUMN */}
      <div className="flex flex-col gap-[10px]">
        {/* Row 1 — 2 columns */}
        <div className="grid gap-[10px] grid-cols-1 xl:grid-cols-[1fr_1.6fr]">
          {/* Left Column: Technology Stack */}
          <Panel style={{ flex: 1 }} delay={0.08}>
            <PanelHead meta="stack.cfg">
              <Dagger /> ~/{" "}
              <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
                TECHNOLOGY_STACK
              </b>
            </PanelHead>
            <PanelBody className="flex flex-col gap-[16px]">
              {TECH_STACK.map((group) => (
                <div key={group.category}>
                  <p
                    className="text-[11px] mb-[10px]"
                    style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
                  >
                    {"// "}{group.category}
                  </p>
                  <div className="flex flex-wrap gap-[8px]">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-[10px] py-[4px] border tracking-[0.5px]"
                        style={{
                          borderColor: "var(--border2)",
                          color: "var(--text2)",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </PanelBody>
          </Panel>

          {/* Middle Column: Hero panel */}
          <Panel delay={0.16} className="flex flex-col h-full">
            <PanelHead meta="fastfetch · hero.md">
              <Dagger /> ~/{" "}
              <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
                HERO
              </b>
            </PanelHead>
            <PanelBody className="flex flex-col">
              <div className="flex flex-col md:flex-row gap-[24px] md:gap-[48px] items-start mb-[24px]">
                <div>
                  <p
                    className="text-[11px] tracking-[3px] uppercase mb-[12px]"
                    style={{ color: "var(--red)" }}
                  >
                    {"// portfolio"}
                  </p>
                  {/* Wordmark */}
                  <h1
                    className="text-[48px] md:text-[64px] leading-none mb-[4px]"
                    style={{
                      fontFamily: "var(--display)",
                      color: "var(--text)",
                      textShadow: "0 0 30px rgba(255,36,54,0.25)",
                      }}
                  >
                    Snehil Gautam
                  </h1>
                  <p className="text-[12px]" style={{ color: "var(--text2)" }}>
                    <b style={{ color: "var(--red-ember)", fontWeight: 500 }}>
                      @zaevotic
                    </b>
                    <br />
                    IIT Jodhpur · Artificial Intelligence and Data Science
                  </p>

                  <div className="flex gap-[12px] mt-[24px]">
                    <button
                      onClick={() => document.dispatchEvent(new CustomEvent("open-resume"))}
                      className="px-[16px] py-[8px] text-[11px] tracking-[1px] uppercase font-bold border cursor-pointer transition-colors hover:bg-[var(--red-hover-tint)]"
                      style={{
                        borderColor: "var(--border2)",
                        color: "var(--text)",
                      }}
                    >
                      [+] resume
                    </button>
                  </div>
                </div>
                {/* Bio — greentext style */}
                <div
                  className="text-[12px]"
                  style={{
                    fontFamily: "var(--mono)",
                    color: "var(--text2)",
                    lineHeight: "1.65",
                    maxWidth: "48ch",
                  }}
                >
                  <p
                    className="text-[11px] tracking-[3px] uppercase mb-[12px]"
                    style={{ color: "var(--red)" }}
                  >
                    {"// bio.greentext"}
                  </p>
                  <p>&gt; Be me</p>
                  <p>&gt; AI &amp; Data Science student</p>
                  <p>&gt; pacman -Syu</p>
                  <p>&gt; bootloader gone, fix anyway, 3am</p>
                  <p>
                    &gt;{" "}
                    <span style={{ color: "var(--red-ember)" }}>
                      LINUX GOOD. WINDOWS BAD.
                    </span>
                  </p>
                  <p>&gt; spend 6 hour make bar pretty</p>
                  <p>
                    &gt; assignment due in 2 hour, brain say &quot;later&quot;
                  </p>
                  <p>&gt; read paper, big word, close paper</p>
                  <p>&gt; BUILD ANYWAY. it work. why work. nobody know.</p>
                  <p>&gt; profit (yay)</p>
                </div>
              </div>

              {/* Rotating Marquee Strips pushed to bottom */}
              <div className="mt-auto">
                <HeroMarquee />
              </div>
            </PanelBody>
          </Panel>
        </div>

        {/* Row 2 — System Log and Featured Projects */}
        <div className="grid gap-[10px] grid-cols-1 xl:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-[10px]">
            <Panel delay={0.24}>
              <PanelHead meta="github_heatmap.svg">
                <Dagger /> ~/{" "}
                <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
                  GITHUB
                </b>
              </PanelHead>
              <PanelBody>
                <GithubHeatmap />
              </PanelBody>
            </Panel>
            <SystemLogPanel delay={0.32} />
          </div>
          <div className="hidden xl:block">
            <FeaturedProjectsPanel delay={0.40} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: LEADERBOARD & WAKATIME */}
      <div className="flex flex-col gap-[10px]">
        <LeaderboardPanel delay={0.48} />

        {/* Wakatime */}
        <WakaTimePanel delay={0.56} />

        {/* Featured Projects (Tablet & Mobile only) */}
        <div className="block xl:hidden">
          <FeaturedProjectsPanel delay={0.64} />
        </div>
      </div>
    </div>
  );
}
