"use client";

import Link from "next/link";

import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import SystemLogPanel from "@/components/ui/SystemLogPanel";
import FeaturedProjectsPanel from "@/components/ui/FeaturedProjectsPanel";
import GithubHeatmap from "@/components/sys/log/github";
import HeroMarquee from "@/components/ui/HeroMarquee";
import RotatingJournal from "@/components/ui/RotatingJournal";
import WakaTimePanel from "@/components/sys/log/wakatime_panel";

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

const WAKA = [
  { lang: "Rust", pct: 34.1 },
  { lang: "Python", pct: 24.5 },
  { lang: "TypeScript", pct: 17.6 },
  { lang: "QML", pct: 11.3 },
  { lang: "Bash", pct: 4.7 },
];

const POSTS = [
  {
    date: "2025-11-12",
    tag: "systems",
    title: "Designing a Semantic Filesystem Without an Agent",
    excerpt:
      "Why the semantic layer in zaOS lives independently of any AI runtime, and how xattr can carry meaning at the kernel boundary without special-casing anything.",
  },
  {
    date: "2025-10-28",
    tag: "wayland",
    title: "Niri Is What I Wanted Sway to Be",
    excerpt:
      "A month in with the scrollable-columns compositor. What the model gets right, where the rough edges are, and why I'm not going back.",
  },
  {
    date: "2025-10-04",
    tag: "tooling",
    title: "Generating Animated SVGs with GitHub Actions",
    excerpt:
      "Injecting live GraphQL stats into a fastfetch-style SVG and auto-committing via Actions. The full pipeline, the gotchas, and what I'd do differently.",
  },
  {
    date: "2025-09-15",
    tag: "rust",
    title: "Why I Reach for Rust on Side Projects Now",
    excerpt:
      "Not an essay about memory safety. About the feedback loop: the compiler as a collaborator that tells you exactly what you got wrong, immediately.",
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
          <Panel style={{ flex: 1 }} delay={0.1}>
            <PanelHead>
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
                    // {group.category}
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
          <Panel delay={0.2} className="flex flex-col h-full">
            <PanelHead meta="fastfetch">
              <Dagger /> ~/{" "}
              <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
                hero.md
              </b>
            </PanelHead>
            <PanelBody className="flex flex-col">
              <div className="flex flex-col md:flex-row gap-[24px] md:gap-[48px] items-start mb-[24px]">
                <div>
                  <p
                    className="text-[11px] tracking-[3px] uppercase mb-[12px]"
                    style={{ color: "var(--red)" }}
                  >
                    // portfolio
                  </p>
                  {/* Wordmark */}
                  <h1
                    className="text-[48px] md:text-[64px] leading-none mb-[4px]"
                    style={{
                      fontFamily: "var(--display)",
                      color: "var(--text)",
                      textShadow: "0 0 30px rgba(255,36,54,0.25)",
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
                      className="px-[16px] py-[8px] text-[11px] tracking-[1px] uppercase font-bold border cursor-pointer transition-colors hover:bg-[rgba(182,24,43,0.03)]"
                      style={{
                        borderColor: "var(--border2)",
                        color: "var(--text)",
                      }}
                    >
                      [+] resume
                    </button>
                    <Link
                      href="/work"
                      className="px-[16px] py-[8px] text-[11px] tracking-[1px] uppercase font-bold border cursor-pointer transition-colors hover:bg-[rgba(182,24,43,0.03)] no-underline"
                      style={{
                        borderColor: "var(--border2)",
                        color: "var(--text)",
                      }}
                    >
                      [~] work
                    </Link>
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
                    // bio.greentext
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
            <Panel delay={0.3}>
              <PanelHead>
                <Dagger /> <b style={{ color: "var(--text)" }}>GH</b>{" "}
                github_heatmap.svg
              </PanelHead>
              <PanelBody>
                <GithubHeatmap />
              </PanelBody>
            </Panel>
            <SystemLogPanel delay={0.4} />
          </div>
          <div className="hidden xl:block">
            <FeaturedProjectsPanel delay={0.5} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: JOURNAL */}
      <div className="flex flex-col gap-[10px]">
        <Panel delay={0.6}>
          <PanelHead>
            <Dagger /> <b style={{ color: "var(--text)" }}>JOURNAL</b>{" "}
            entries.log
          </PanelHead>
          <PanelBody>
            <p
              className="text-[10px] tracking-[.04em] mb-[12px]"
              style={{ color: "var(--text3)" }}
            >
              // <span style={{ color: "var(--amber)" }}>4 entries</span> ·
              draft → publish pipeline
            </p>
            <RotatingJournal posts={POSTS} />
          </PanelBody>
        </Panel>

        {/* Wakatime */}
        <WakaTimePanel delay={0.7} />

        {/* Featured Projects (Tablet & Mobile only) */}
        <div className="block xl:hidden">
          <FeaturedProjectsPanel delay={0.8} />
        </div>
      </div>
    </div>
  );
}
