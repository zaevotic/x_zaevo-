"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import { SiArchlinux } from "react-icons/si";
import { MdHome } from "react-icons/md";
import KeyboardPanel from "@/components/sys/signal/keyboard";
import LeaderboardPanel from "@/components/sys/log/leaderboard";
import TypingTerminal from "@/components/sys/dev/tty";
import ZaevoLogo from "@/components/ui/ZaevoLogo";

// ── Types ─────────────────────────────────────────────────────────────────────

type LogLevel = "ok" | "inf" | "err";

interface LogEntry {
  level: LogLevel;
  msg: React.ReactNode;
}

// ── Static content ────────────────────────────────────────────────────────────

const DEFAULT_DEPLOY_DATE = "2026-11-03T14:48:59+05:30";

function formatUptime(diffMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days === 0 && hours === 0) {
    return `${minutes} ${minutes === 1 ? "min" : "mins"}, ${seconds} ${seconds === 1 ? "sec" : "secs"}`;
  }

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  parts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);

  return parts.join(", ");
}

const FASTFETCH_ROWS = [
  { k: "OS", v: "Arch Linux x86_64" },
  { k: "Host", v: "OMEN by HP Gaming Laptop 16-wf1xxx" },
  { k: "Kernel", v: "Linux Zen" },
  { k: "Uptime", v: "0 mins, 0 secs" },
  { k: "Shell", v: "zsh " },
  { k: "WM", v: "niri (Wayland)" },
  { k: "Terminal", v: "kitty" },
  { k: "CPU", v: "Intel(R) Core(TM) i7-14650HX (16+8) @ 5.20 GHz" },
  { k: "GPU", v: "NVIDIA GeForce RTX 4060 Max-Q / Mobile [Discrete]" },
  { k: "Memory", v: "16 GB DDR5 @ 5600 MT/s (2x8 GB SODIMM)" },
  { k: "Filesystem", v: "BTRFS" },
];

interface GitCommitItem {
  hash: string;
  msg: string;
  fresh: boolean;
}

const DEFAULT_GIT_LOG: GitCommitItem[] = [
  {
    hash: "9956bef",
    msg: "(HEAD -> main, origin/main, origin/HEAD) feat: add journal scroll controls, live wakatime share, and commit hash tracking",
    fresh: true,
  },
  {
    hash: "33fed8e",
    msg: "fix: whitelisted pubkey.pem (I forgor)",
    fresh: false,
  },
  {
    hash: "aacc49f",
    msg: "refactor: convert journal to standalone workspace, fix wakatime api and mobile resume zoom, and wire pubkey",
    fresh: false,
  },
  {
    hash: "c13f663",
    msg: "style: update site metadata description and title for link previews",
    fresh: false,
  },
  {
    hash: "13316fe",
    msg: "fix: resolve strict typescript errors in drizzle queries and log callbacks for production build",
    fresh: false,
  },
];

const JOURNAL_LOGS: LogEntry[] = [
  {
    level: "inf",
    msg: "ready - started server on 0.0.0.0:3000, url: http://localhost:3000",
  },
];

const LEVEL_COLOR: Record<LogLevel, string> = {
  ok: "var(--green)",
  inf: "var(--amber)",
  err: "var(--red)",
};

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TermPage() {
  const shellBottomRef = useRef<HTMLDivElement>(null);

  const [deployDate, setDeployDate] = useState<string>(
    () => process.env.NEXT_PUBLIC_DEPLOY_TIME || DEFAULT_DEPLOY_DATE,
  );
  const [uptimeStr, setUptimeStr] = useState<string>(() => {
    const raw = process.env.NEXT_PUBLIC_DEPLOY_TIME || DEFAULT_DEPLOY_DATE;
    return formatUptime(Date.now() - new Date(raw).getTime());
  });
  const [gitLog, setGitLog] = useState<GitCommitItem[]>(() => {
    try {
      const baked = process.env.NEXT_PUBLIC_GIT_COMMITS;
      if (baked) {
        const parsed = JSON.parse(baked);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_GIT_LOG;
  });

  useEffect(() => {
    fetch("/api/sys/commit")
      .then((res) => res.json())
      .then((data) => {
        if (data?.deployedAt) {
          setDeployDate(data.deployedAt);
          setUptimeStr(
            formatUptime(Date.now() - new Date(data.deployedAt).getTime()),
          );
        }
        if (Array.isArray(data?.commits) && data.commits.length > 0) {
          setGitLog(data.commits);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const target = deployDate || process.env.NEXT_PUBLIC_DEPLOY_TIME;
    if (!target) return;

    const interval = setInterval(() => {
      setUptimeStr(formatUptime(Date.now() - new Date(target).getTime()));
    }, 1000);

    return () => clearInterval(interval);
  }, [deployDate]);

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
        delay={0.08}
      >
        <MatrixCanvas />
        <PanelHead meta="zaevo@OMEN-erde · kitty.sh">
          <Dagger /> ~/{" "}
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            TERMINAL
          </b>
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
                {FASTFETCH_ROWS.map(({ k, v }) => {
                  const displayVal = k === "Uptime" ? uptimeStr : v;
                  return (
                    <div key={k} className="truncate" style={{ color: "var(--text2)" }}>
                      {"  "}
                      <span
                        style={{
                          display: "inline-block",
                          width: 96,
                          color: "var(--text3)",
                        }}
                      >
                        {k}
                      </span>
                      <span style={{ color: "var(--text)" }}>{displayVal}</span>
                    </div>
                  );
                })}
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
            {gitLog.map((entry) => (
              <div key={entry.hash} className="truncate">
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

      {/* ── TYPING TEST PANEL (bottom-right) ──────────────────────── */}
      <Panel className="md:col-span-2 xl:col-[5/11] xl:row-[4/11]" delay={0.32}>
        <PanelHead meta="ttype · monkeytype.sh">
          <Dagger /> ~/{" "}
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            TYPING_TEST
          </b>
        </PanelHead>
        <PanelBody className="flex flex-col">
          <TypingTerminal />
        </PanelBody>
      </Panel>

      {/* ── JOURNALCTL PANEL (bottom-left) ──────────────────────── */}
      <Panel
        className="hide-single-col hidden md:flex md:col-span-2 xl:col-[1/5] xl:row-[9/11]"
        delay={0.40}
      >
        <PanelHead meta="journalctl -f · sys.log">
          <Dagger /> ~/{" "}
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            JOURNALCTL
          </b>
        </PanelHead>
        <PanelBody className="flex-1 overflow-hidden flex flex-col min-h-0" style={{ padding: "10px 12px" }}>
          <JournalLog entries={JOURNAL_LOGS} />
        </PanelBody>
      </Panel>

      {/* ── KEYBOARD PANEL (top-right) ─────────────────────────── */}
      <Panel className="md:col-span-1 xl:col-[5/8] xl:row-[1/4]" delay={0.16}>
        <PanelHead meta="keyboard.live">
          <Dagger /> ~/{" "}
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            KEYBOARD
          </b>
        </PanelHead>
        <PanelBody
          className="flex flex-col h-full overflow-hidden !p-[6px] sm:!p-[8px_10px] items-center justify-center"
          style={{ minHeight: 0, fontFamily: "var(--mono)" }}
        >
          <KeyboardPanel />
        </PanelBody>
      </Panel>

      {/* ── LEADERBOARD PANEL (top-right 2) ──────────────────────── */}
      <LeaderboardPanel
        className="md:col-span-1 xl:col-[8/11] xl:row-[1/4]"
        delay={0.24}
        compact
        hideFooter
        fallbackRedirectUrl="/term"
      />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const emptySubscribe = () => () => {};

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
  
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    const id = setInterval(() => {
      const endpoints = ["/api/sys/spotify", "/api/sys/github", "/api/sys/wakatime", "/", "/term", "/signal"];
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
