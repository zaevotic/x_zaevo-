"use client";

import { useEffect, useRef, useState } from "react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import { SiArchlinux } from "react-icons/si";
import { MdHome } from "react-icons/md";
import {
  VscFolder,
  VscFileCode,
  VscMarkdown,
  VscLock,
  VscJson,
  VscSettingsGear,
  VscFile,
} from "react-icons/vsc";
import KeyboardPanel from "@/components/sys/signal/keyboard";
import KeybindsPanel from "@/components/sys/signal/keybinds";
import ZaevoLogo from "@/components/ui/ZaevoLogo";

// ── Types ─────────────────────────────────────────────────────────────────────

type LogLevel = "ok" | "inf" | "err";

interface LogEntry {
  level: LogLevel;
  msg: React.ReactNode;
}

// ── Static content ────────────────────────────────────────────────────────────

const FASTFETCH_ROWS = [
  { k: "OS", v: "Arch Linux x86_64" },
  { k: "Host", v: "OMEN by HP Gaming Laptop 16-wf1xxx" },
  { k: "Kernel", v: "Linux 7.1.2-zen3-1-zen" },
  { k: "Uptime", v: "18 hours, 4 mins" },
  { k: "Shell", v: "zsh 5.9.1" },
  { k: "WM", v: "niri 26.04 (Wayland)" },
  { k: "Terminal", v: "kitty 0.47.4" },
  { k: "CPU", v: "Intel(R) Core(TM) i7-14650HX (16+8) @ 5.20 GHz" },
  { k: "GPU", v: "NVIDIA GeForce RTX 4060 Max-Q / Mobile [Discrete]" },
  { k: "Memory", v: "13.28 GiB / 15.31 GiB (87%)" },
  { k: "Disk (/)", v: "648.99 GiB / 707.35 GiB (92%) - btrfs" },
];

const GIT_LOG = [
  {
    hash: "6545df1",
    msg: "(HEAD -> main, origin/main, origin/HEAD) feat: populated the term page, implemented working keymap highlights",
    fresh: true,
  },
  {
    hash: "03c54a7",
    msg: "feat: implement tiling wm interface, core workspaces, and letterglitch canvas with ui/ux animations",
    fresh: false,
  },
  { hash: "716a330", msg: "feat: initialised next.js", fresh: false },
  { hash: "dde95e7", msg: "Initial commit", fresh: false },
];

const JOURNAL_LOGS: LogEntry[] = [
  {
    level: "inf",
    msg: "ready - started server on 0.0.0.0:3000, url: http://localhost:3000",
  },
];

const TREE_DATA = [
  { p: "├──  ", n: "AGENTS.md" },
  { p: "├──  ", n: "app", isDir: true },
  { p: "│   ├──  ", n: "(workspaces)", isDir: true },
  { p: "│   │   ├──  ", n: "contact", isDir: true },
  { p: "│   │   │   └──  ", n: "page.tsx" },
  { p: "│   │   ├──  ", n: "home", isDir: true },
  { p: "│   │   │   └──  ", n: "page.tsx" },
  { p: "│   │   ├──  ", n: "journal", isDir: true },
  { p: "│   │   │   └──  ", n: "page.tsx" },
  { p: "│   │   ├──  ", n: "layout.tsx" },
  { p: "│   │   ├──  ", n: "signal", isDir: true },
  { p: "│   │   │   └──  ", n: "page.tsx" },
  { p: "│   │   ├──  ", n: "template.tsx" },
  { p: "│   │   └──  ", n: "term", isDir: true },
  { p: "│   │       └──  ", n: "page.tsx" },
  { p: "│   ├──  ", n: "favicon.ico" },
  { p: "│   ├──  ", n: "globals.css" },
  { p: "│   ├──  ", n: "layout.tsx" },
  { p: "│   └──  ", n: "page.tsx" },
  { p: "├──  ", n: "bun.lock" },
  { p: "├──  ", n: "CLAUDE.md" },
  { p: "├──  ", n: "components", isDir: true },
  { p: "│   ├──  ", n: "sys", isDir: true },
  { p: "│   │   ├──  ", n: "dev", isDir: true },
  { p: "│   │   │   ├──  ", n: "dsp.tsx" },
  { p: "│   │   │   ├──  ", n: "kbd.tsx" },
  { p: "│   │   │   └──  ", n: "tty.tsx" },
  { p: "│   │   ├──  ", n: "log", isDir: true },
  { p: "│   │   │   ├──  ", n: "github.tsx" },
  { p: "│   │   │   ├──  ", n: "sysinfo.tsx" },
  { p: "│   │   │   └──  ", n: "wakatime.tsx" },
  { p: "│   │   └──  ", n: "signal", isDir: true },
  { p: "│   │       ├──  ", n: "keybinds.tsx" },
  { p: "│   │       ├──  ", n: "keyboard.tsx" },
  { p: "│   │       └──  ", n: "spotify.tsx" },
  { p: "│   └──  ", n: "ui", isDir: true },
  { p: "│       ├──  ", n: "CustomCursor.tsx" },
  { p: "│       ├──  ", n: "LetterGlitch.tsx" },
  { p: "│       ├──  ", n: "MonitorBar.tsx" },
  { p: "│       ├──  ", n: "Panel.tsx" },
  { p: "│       └──  ", n: "StatusBar.tsx" },
  { p: "├──  ", n: "config", isDir: true },
  { p: "├──  ", n: "eslint.config.mjs" },
  { p: "├──  ", n: "LICENSE" },
  { p: "├──  ", n: "next-env.d.ts" },
  { p: "├──  ", n: "next.config.ts" },
  { p: "├──  ", n: "package.json" },
  { p: "├──  ", n: "PORTFOLIO_UPGRADE_GUIDE.md" },
  { p: "├──  ", n: "postcss.config.mjs" },
  { p: "├──  ", n: "public", isDir: true },
  { p: "│   ├──  ", n: "file.svg" },
  { p: "│   ├──  ", n: "globe.svg" },
  { p: "│   ├──  ", n: "journals", isDir: true },
  { p: "│   ├──  ", n: "next.svg" },
  { p: "│   ├──  ", n: "relics", isDir: true },
  { p: "│   ├──  ", n: "vercel.svg" },
  { p: "│   └──  ", n: "window.svg" },
  { p: "├──  ", n: "react_bits_refs", isDir: true },
  { p: "│   ├──  ", n: "border_glow.md" },
  { p: "│   ├──  ", n: "letter_glitch.md" },
  { p: "│   └──  ", n: "magic_bento.md" },
  { p: "├──  ", n: "README-next.md" },
  { p: "├──  ", n: "README.md" },
  { p: "└──  ", n: "tsconfig.json" },
];

const LEVEL_COLOR: Record<LogLevel, string> = {
  ok: "var(--green)",
  inf: "var(--amber)",
  err: "var(--red)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTreeIcon(name: string, isDir?: boolean) {
  if (isDir) return { Icon: VscFolder, color: "var(--amber)" };
  if (name.endsWith(".md")) return { Icon: VscMarkdown, color: "var(--amber)" };
  if (name.endsWith(".tsx") || name.endsWith(".ts"))
    return { Icon: VscFileCode, color: "var(--text2)" };
  if (name.endsWith(".json")) return { Icon: VscJson, color: "var(--amber)" };
  if (name.includes("config") || name.startsWith(".git"))
    return { Icon: VscSettingsGear, color: "var(--red)" };
  if (name.endsWith(".lock")) return { Icon: VscLock, color: "var(--text2)" };
  if (name.endsWith(".css"))
    return { Icon: VscFileCode, color: "var(--text2)" };
  return { Icon: VscFile, color: "var(--text2)" };
}

function bar(pct: number, len = 20) {
  const filled = Math.round((pct / 100) * len);
  return "█".repeat(filled) + "░".repeat(len - filled);
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Prompt line — ps1 + optional coloured tokens */
function ShellLine({
  cmd,
  arg,
  flag,
  time = "15:36:35",
  order = "flag-first",
}: {
  cmd: string;
  arg?: string;
  flag?: string;
  time?: string;
  order?: "flag-first" | "arg-first";
}) {
  return (
    <div className="flex flex-col text-[11px] leading-[1.75]">
      <div style={{ color: "var(--border2)" }}>┌──────&gt;</div>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <span style={{ color: "var(--border2)" }}>│ </span>
          <span
            style={{
              color: "var(--red)",
              marginLeft: 4,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <SiArchlinux className="text-[12px]" /> zaevo
          </span>
          <span style={{ color: "var(--text2)", margin: "0 4px" }}>on</span>
          <span style={{ color: "var(--amber)" }}>OMEN-erde</span>
          <span style={{ color: "var(--text2)", margin: "0 4px" }}>at</span>
          <span
            style={{
              color: "var(--green)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <MdHome className="text-[13px]" /> ~
          </span>
        </div>
        <span style={{ color: "var(--text3)" }}>{time}</span>
      </div>
      <div className="flex gap-[6px] whitespace-pre">
        <span style={{ color: "var(--border2)" }}>└─&gt;</span>
        <span style={{ color: "var(--text)" }}>{cmd}</span>
        {order === "flag-first" ? (
          <>
            {flag && <span style={{ color: "var(--text3)" }}>{flag}</span>}
            {arg && <span style={{ color: "var(--amber)" }}>{arg}</span>}
          </>
        ) : (
          <>
            {arg && <span style={{ color: "var(--amber)" }}>{arg}</span>}
            {flag && <span style={{ color: "var(--text3)" }}>{flag}</span>}
          </>
        )}
      </div>
    </div>
  );
}

/** Matrix rain canvas overlay */
function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CHARS = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01";

    let drops: number[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth ?? 0;
      canvas.height = canvas.parentElement?.clientHeight ?? 0;
      const cols = Math.floor(canvas.width / 12);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    }

    resize();
    window.addEventListener("resize", resize);

    const id = setInterval(() => {
      if (!ctx || !canvas) return;
      ctx.fillStyle = "rgba(10,9,8,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#b6182b";
      ctx.font = "12px 'JetBrains Mono', monospace";
      drops.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * 12, y * 12);
        if (y * 12 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      });
    }, 80);

    return () => {
      clearInterval(id);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.04,
        pointerEvents: "none",
      }}
    />
  );
}

/** Pulsing sysinfo panel */
function SysInfoPanel() {
  const [metrics, setMetrics] = useState({
    cpu: 23,
    mem: 46,
    gpu: 8,
    disk: 30,
    temp: 51,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics({
        cpu: 15 + Math.floor(Math.random() * 45),
        mem: 43 + Math.floor(Math.random() * 8),
        gpu: 5 + Math.floor(Math.random() * 20),
        disk: 30,
        temp: 48 + Math.floor(Math.random() * 12),
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const rows = [
    { label: "cpu", val: `${metrics.cpu}%`, barVal: metrics.cpu },
    { label: "mem", val: `${metrics.mem}%`, barVal: metrics.mem },
    { label: "gpu", val: `${metrics.gpu}%`, barVal: metrics.gpu },
    { label: "disk", val: `${metrics.disk}%`, barVal: metrics.disk },
  ];

  return (
    <div
      className="text-[10px] leading-[1.65]"
      style={{
        fontFamily: "var(--mono)",
        color: "var(--text3)",
        whiteSpace: "nowrap",
      }}
    >
      {rows.map(({ label, val, barVal }) => (
        <div key={label}>
          <span style={{ display: "inline-block", width: 40 }}>{label}</span>
          <span style={{ color: "var(--amber)", marginRight: 8 }}>{val}</span>
          <span style={{ color: "var(--text3)" }}>{bar(barVal)}</span>
        </div>
      ))}
      <div>&nbsp;</div>
      <div>
        <span style={{ display: "inline-block", width: 40 }}>temp</span>
        <span style={{ color: "var(--amber)" }}>{metrics.temp}°C</span>
        <span style={{ color: "var(--text2)", marginLeft: 8 }}>
          Ryzen 7 5800H
        </span>
      </div>
      <div>
        <span style={{ display: "inline-block", width: 40 }}>uptime</span>
        <span style={{ color: "var(--text2)" }}>47d 12h 09m</span>
      </div>
      <div>
        <span style={{ display: "inline-block", width: 40 }}>load</span>
        <span style={{ color: "var(--text2)" }}>0.72 0.81 0.94</span>
      </div>
      <div>
        <span style={{ display: "inline-block", width: 40 }}>procs</span>
        <span style={{ color: "var(--amber)" }}>241</span>
        <span style={{ color: "var(--text3)", marginLeft: 8 }}>running</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TermPage() {
  const shellBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shellBottomRef.current) {
      shellBottomRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, []);

  return (
    <div
      className="flex flex-col md:grid md:grid-cols-2 xl:grid-cols-[repeat(10,1fr)] xl:grid-rows-[repeat(10,1fr)] gap-[10px] h-auto xl:h-full"
    >
      {/* ── SHELL PANEL (top-left) ──────────────────────────── */}
      <Panel
        className="relative md:col-span-2 xl:col-[1/5] xl:row-[1/9]"
        delay={0.1}
      >
        <MatrixCanvas />
        <PanelHead>
          <Dagger />{" "}
          <b
            style={{
              color: "var(--red)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontSize: 10,
            }}
          >
            zsh
          </b>
          <span
            className="text-[11px] normal-case tracking-normal"
            style={{ color: "var(--text3)" }}
          >
            kitty — zaevo@OMEN-erde
          </span>
        </PanelHead>
        <PanelBody style={{ position: "relative", zIndex: 1 }}>
          <div
            className="text-[11px] leading-[1.75]"
            style={{ color: "var(--text2)" }}
          >
            {/* fastfetch */}
            <div className="h-[6px]" />
            <ShellLine cmd="fastfetch" time="15:35:10" />
            <div className="flex items-center gap-[14px]">
              <div className="shrink-0 flex items-center justify-center">
                <ZaevoLogo size={185} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate" style={{ color: "var(--border2)" }}>
                  ┌─────────────────────────────────────────────────┐
                </div>
                {FASTFETCH_ROWS.map(({ k, v }) => (
                  <div key={k} className="truncate" style={{ color: "var(--text2)" }}>
                    {"  "}
                    <span
                      style={{
                        display: "inline-block",
                        width: 88,
                        color: "var(--text3)",
                      }}
                    >
                      {k}
                    </span>
                    <span style={{ color: "var(--text)" }}>{v}</span>
                  </div>
                ))}
                <div className="truncate" style={{ color: "var(--border2)" }}>
                  └─────────────────────────────────────────────────┘
                </div>
              </div>
            </div>

            {/* git log */}
            <div className="h-[6px]" />
            <ShellLine
              cmd="git"
              arg=" log"
              flag=" --oneline -5"
              time="15:35:14"
              order="arg-first"
            />
            {GIT_LOG.map((entry) => (
              <div key={entry.hash}>
                <span
                  style={{
                    color: entry.fresh ? "var(--green)" : "var(--text2)",
                  }}
                >
                  {entry.hash}
                </span>{" "}
                <span style={{ color: "var(--text2)" }}>{entry.msg}</span>
              </div>
            ))}

            {/* systemctl */}
            <div className="h-[6px]" />
            <ShellLine
              cmd="systemctl"
              flag=" --user"
              arg=" status pipewire"
              time="15:36:01"
            />
            <div>
              <span style={{ color: "var(--green)" }}>● pipewire.service</span>
              <span style={{ color: "var(--text2)" }}>
                {" "}
                - PipeWire Multimedia Service
              </span>
            </div>
            <div style={{ color: "var(--text2)" }}>
              {"   Loaded: loaded (/usr/lib/systemd/user/pipewire.service)"}
            </div>
            <div style={{ color: "var(--amber)" }}>
              {"   Active: active (running) since Mon 2025-11-18"}
            </div>
            <div className="h-[6px]" />
          </div>

          {/* Blinking cursor */}
          <div className="flex flex-col text-[11px] leading-[1.75]">
            <div style={{ color: "var(--border2)" }}>┌──────&gt;</div>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <span style={{ color: "var(--border2)" }}>│ </span>
                <span
                  style={{
                    color: "var(--red)",
                    marginLeft: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <SiArchlinux className="text-[12px]" /> zaevo
                </span>
                <span style={{ color: "var(--text2)", margin: "0 4px" }}>
                  on
                </span>
                <span style={{ color: "var(--amber)" }}>OMEN-erde</span>
                <span style={{ color: "var(--text2)", margin: "0 4px" }}>
                  at
                </span>
                <span
                  style={{
                    color: "var(--green)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <MdHome className="text-[13px]" /> ~
                </span>
              </div>
              <span style={{ color: "var(--text3)" }}>15:36:35</span>
            </div>
            <div className="flex gap-[6px] items-center">
              <span style={{ color: "var(--border2)" }}>└─&gt;</span>
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 14,
                  background: "var(--red)",
                  verticalAlign: "middle",
                  animation: "cur-blink 1.1s step-end infinite",
                }}
              />
            </div>
          </div>
          <div ref={shellBottomRef} />
        </PanelBody>
      </Panel>

      {/* ── FILESYSTEM PANEL (bottom-right) ───────────────────────── */}
      <Panel className="md:col-span-2 xl:col-[5/11] xl:row-[4/11]" delay={0.4}>
        <PanelHead>
          <Dagger />{" "}
          <b
            style={{
              color: "var(--red)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontSize: 10,
            }}
          >
            fs
          </b>
          <span
            className="text-[11px] normal-case tracking-normal"
            style={{ color: "var(--text3)" }}
          >
            ~/repos/x_zaevo- — tree
          </span>
        </PanelHead>
        <PanelBody>
          {/* Tree */}
          <div
            className="text-[11px] leading-[1.8] flex flex-col"
            style={{ fontFamily: "var(--mono)" }}
          >
            <div>
              <span style={{ color: "var(--red)" }}>┌──────&gt;</span>
            </div>
            <div className="flex justify-between w-full pr-[12px]">
              <div>
                <span style={{ color: "var(--red)" }}>│ </span>
                <span style={{ color: "var(--text)" }}>zaevo</span>
                <span style={{ color: "var(--text2)" }}> on </span>
                <span style={{ color: "var(--text)" }}>OMEN-erde</span>
                <span style={{ color: "var(--text2)" }}> at </span>
                <span style={{ color: "var(--amber)" }}>…/x_zaevo-</span>
                <span style={{ color: "var(--text2)" }}> via </span>
                <span style={{ color: "var(--green)" }}>main</span>
              </div>
              <div style={{ color: "var(--text2)" }}>09:52:42</div>
            </div>
            <div>
              <span style={{ color: "var(--red)" }}>└─&gt; </span>
              <span style={{ color: "var(--text)" }}>tree</span>
            </div>
            <div>
              <span style={{ color: "var(--amber)" }}> .</span>
            </div>

            {TREE_DATA.map((row, idx) => {
              const { Icon, color } = getTreeIcon(row.n, row.isDir);
              return (
                <div key={idx}>
                  <span
                    style={{ color: "var(--border2)" }}
                    className="whitespace-pre"
                  >
                    {row.p}
                  </span>
                  <span style={{ color }}>
                    <Icon size={12} className="inline mb-[2px] mr-[6px]" />
                    {row.n}
                  </span>
                </div>
              );
            })}
          </div>
        </PanelBody>
      </Panel>

      {/* ── JOURNAL LOG PANEL (bottom-left) ──────────────────────── */}
      <Panel
        className="md:col-span-2 xl:col-[1/5] xl:row-[9/11]"
        delay={0.3}
      >
        <PanelHead>
          <Dagger />{" "}
          <b
            style={{
              color: "var(--red)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontSize: 10,
            }}
          >
            log
          </b>
          <span
            className="text-[11px] normal-case tracking-normal"
            style={{ color: "var(--text3)" }}
          >
            journalctl -f
          </span>
        </PanelHead>
        <PanelBody className="flex-1 overflow-hidden flex flex-col min-h-0" style={{ padding: "10px 12px" }}>
          <JournalLog entries={JOURNAL_LOGS} />
        </PanelBody>
      </Panel>

      {/* ── KEYBOARD PANEL (top-right) ─────────────────────────── */}
      <Panel className="md:col-span-1 xl:col-[5/8] xl:row-[1/4]" delay={0.2}>
        <PanelHead>
          <Dagger />{" "}
          <b
            style={{
              color: "var(--red)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontSize: 10,
            }}
          >
            kbd
          </b>
          <span
            className="text-[11px] normal-case tracking-normal"
            style={{ color: "var(--text3)" }}
          >
            keyboard.live
          </span>
        </PanelHead>
        <PanelBody style={{ padding: "10px 12px" }}>
          <KeyboardPanel />
        </PanelBody>
      </Panel>

      {/* ── KEYBINDS PANEL (top-right 2) ─────────────────────────── */}
      <Panel className="md:col-span-1 xl:col-[8/11] xl:row-[1/4]" delay={0.3}>
        <PanelHead>
          <Dagger />{" "}
          <b
            style={{
              color: "var(--red)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontSize: 10,
            }}
          >
            kbd
          </b>
          <span
            className="text-[11px] normal-case tracking-normal"
            style={{ color: "var(--text3)" }}
          >
            niri_keybinds.conf
          </span>
        </PanelHead>
        <PanelBody style={{ padding: "10px 12px" }}>
          <KeybindsPanel />
        </PanelBody>
      </Panel>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FsRow({
  gutter,
  name,
  type,
  indent = 0,
  selected = false,
}: {
  gutter: string;
  name: string;
  type: "dir" | "file" | "link" | "exec";
  indent?: number;
  selected?: boolean;
}) {
  const COLOR = {
    dir: "var(--amber)",
    file: "var(--text2)",
    link: "var(--green)",
    exec: "var(--red)",
  };
  return (
    <div style={{ paddingLeft: indent * 14 }}>
      <span
        style={{ color: "var(--border2)", marginRight: 4, userSelect: "none" }}
      >
        {gutter}
      </span>
      <span
        style={{
          color: COLOR[type],
          background: selected ? "var(--red-mute)" : undefined,
          padding: selected ? "0 4px" : undefined,
          borderRadius: selected ? 2 : undefined,
        }}
      >
        {name}
      </span>
    </div>
  );
}

const MAX_LOG_LINES = 7;

function JournalLog({ entries: initialEntries }: { entries: LogEntry[] }) {
  const [entries, setEntries] = useState(() => 
    initialEntries.slice(-MAX_LOG_LINES).map((e, i) => ({
      ...e,
      id: `init-${i}`,
      time: new Date(Date.now() - (initialEntries.length - 1 - i) * 3200)
    }))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const id = setInterval(() => {
      const endpoints = ["/api/sys/spotify", "/api/sys/github", "/api/sys/wakatime", "/home", "/term", "/signal"];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const ms = Math.floor(Math.random() * 800) + 15;
      const appMs = ms - Math.floor(Math.random() * 5);
      
      const isErr = Math.random() > 0.95;
      const newEntry = {
        id: `sim-${Date.now()}`,
        time: new Date(),
        level: (isErr ? "err" : "inf") as LogLevel,
        msg: isErr 
          ? `${endpoint.split('/').pop()} unreachable: [TypeError: fetch failed] Connect Timeout Error`
          : `GET ${endpoint} ${Math.random() > 0.98 ? 500 : 200} in ${ms}ms (next.js: 2ms, application-code: ${appMs}ms)`
      };

      setEntries(prev => {
        const next = [...prev, newEntry];
        return next.length > MAX_LOG_LINES ? next.slice(-MAX_LOG_LINES) : next;
      });
    }, 800 + Math.random() * 2000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  if (!mounted) {
    const baseTime = new Date("2026-07-13T15:36:35");
    return (
      <div className="flex flex-col gap-[2px]">
        {initialEntries.slice(-MAX_LOG_LINES).map((e, i) => {
          const ts = new Date(baseTime.getTime() - (initialEntries.length - 1 - i) * 3200);
          const hms = [ts.getHours(), ts.getMinutes(), ts.getSeconds()].map(x => String(x).padStart(2, "0")).join(":");
          return (
            <div key={`static-${i}`} className="flex gap-[8px] text-[10px] leading-[1.7] min-w-0">
              <span style={{ color: "var(--text3)", flexShrink: 0 }}>{hms}</span>
              <span style={{ width: 36, flexShrink: 0, color: LEVEL_COLOR[e.level] }}>{e.level.toUpperCase()}</span>
              <span className="truncate min-w-0 flex-1" style={{ color: "var(--text2)" }}>{e.msg}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col gap-[2px] h-full overflow-y-auto"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`.flex-col::-webkit-scrollbar { display: none; }`}</style>
      {entries.map((e) => {
        const hms = [e.time.getHours(), e.time.getMinutes(), e.time.getSeconds()]
          .map((x) => String(x).padStart(2, "0"))
          .join(":");
        return (
          <div key={e.id} className="flex gap-[8px] text-[10px] leading-[1.7] min-w-0">
            <span style={{ color: "var(--text3)", flexShrink: 0 }}>{hms}</span>
            <span
              style={{
                width: 36,
                flexShrink: 0,
                color: LEVEL_COLOR[e.level],
              }}
            >
              {e.level.toUpperCase()}
            </span>
            <span className="truncate min-w-0 flex-1" style={{ color: "var(--text2)" }}>{e.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
