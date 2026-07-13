'use client';

import { useEffect, useRef, useState } from 'react';
import Panel, { PanelHead, PanelBody, Dagger } from '@/components/ui/Panel';
import { SiArchlinux } from 'react-icons/si';
import { MdHome } from 'react-icons/md';

// ── Types ─────────────────────────────────────────────────────────────────────

type LogLevel = 'ok' | 'inf' | 'err';

interface LogEntry {
  level: LogLevel;
  msg: React.ReactNode;
}

// ── Static content ────────────────────────────────────────────────────────────

const FASTFETCH_ROWS = [
  { k: 'OS',       v: 'Arch Linux x86_64' },
  { k: 'Host',     v: 'OMEN by HP Gaming Laptop 16-wf1xxx' },
  { k: 'Kernel',   v: 'Linux 7.1.2-zen3-1-zen' },
  { k: 'Uptime',   v: '18 hours, 4 mins' },
  { k: 'Shell',    v: 'zsh 5.9.1' },
  { k: 'WM',       v: 'niri 26.04 (Wayland)' },
  { k: 'Terminal', v: 'kitty 0.47.4' },
  { k: 'CPU',      v: 'Intel(R) Core(TM) i7-14650HX (16+8) @ 5.20 GHz' },
  { k: 'GPU',      v: 'NVIDIA GeForce RTX 4060 Max-Q / Mobile [Discrete]' },
  { k: 'Memory',   v: '13.28 GiB / 15.31 GiB (87%)' },
  { k: 'Disk (/)', v: '648.99 GiB / 707.35 GiB (92%) - btrfs' },
];



const GIT_LOG = [
  { hash: 'a3f9c12', msg: 'feat: animated SVG profile README',      fresh: true  },
  { hash: '9b2e041', msg: 'fix: niri keybind IPC edge case',        fresh: false },
  { hash: 'c7d8f30', msg: 'refactor: zaOS semantic layer v2',       fresh: false },
  { hash: '01a4e7b', msg: 'chore: update quickshell QML surfaces',  fresh: false },
  { hash: 'f2b9d18', msg: 'docs: add xattr design notes',           fresh: false },
];

const JOURNAL_LOGS: LogEntry[] = [
  { level: 'ok',  msg: <>niri compositor started on wayland display <span style={{ color: 'var(--text)' }}>wayland-1</span></> },
  { level: 'ok',  msg: <>pipewire session manager <span style={{ color: 'var(--text)' }}>wireplumber</span> ready</> },
  { level: 'inf', msg: <>quickshell: loading QML surface <span style={{ color: 'var(--text)' }}>top-bar</span></> },
  { level: 'inf', msg: <>quickshell: loading QML surface <span style={{ color: 'var(--text)' }}>panel</span></> },
  { level: 'ok',  msg: <>NetworkManager: connection <span style={{ color: 'var(--text)' }}>eduroam</span> active</> },
  { level: 'inf', msg: <>github-actions: workflow <span style={{ color: 'var(--text)' }}>update-readme</span> dispatched</> },
];

const LEVEL_COLOR: Record<LogLevel, string> = {
  ok:  'var(--green)',
  inf: 'var(--amber)',
  err: 'var(--red)',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function bar(pct: number, len = 20) {
  const filled = Math.round((pct / 100) * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Prompt line — ps1 + optional coloured tokens */
function ShellLine({
  cmd,
  arg,
  flag,
  time = '15:36:35',
}: {
  cmd: string;
  arg?: string;
  flag?: string;
  time?: string;
}) {
  return (
    <div className="flex flex-col text-[11px] leading-[1.75]">
      <div style={{ color: 'var(--border2)' }}>┌──────&gt;</div>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <span style={{ color: 'var(--border2)' }}>│ </span>
          <span style={{ color: 'var(--red)', marginLeft: 4, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SiArchlinux className="text-[12px]" /> zaevo
          </span>
          <span style={{ color: 'var(--text2)', margin: '0 4px' }}>on</span>
          <span style={{ color: 'var(--amber)' }}>OMEN-erde</span>
          <span style={{ color: 'var(--text2)', margin: '0 4px' }}>at</span>
          <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MdHome className="text-[13px]" /> ~
          </span>
        </div>
        <span style={{ color: 'var(--text3)' }}>{time}</span>
      </div>
      <div className="flex gap-[6px]">
        <span style={{ color: 'var(--border2)' }}>└─&gt;</span>
        <span style={{ color: 'var(--text)' }}>{cmd}</span>
        {flag && <span style={{ color: 'var(--text3)' }}>{flag}</span>}
        {arg && <span style={{ color: 'var(--amber)' }}>{arg}</span>}
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CHARS =
      'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01';

    let drops: number[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width  = canvas.parentElement?.clientWidth  ?? 0;
      canvas.height = canvas.parentElement?.clientHeight ?? 0;
      const cols = Math.floor(canvas.width / 12);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    }

    resize();
    window.addEventListener('resize', resize);

    const id = setInterval(() => {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(10,9,8,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#b6182b';
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
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        opacity: 0.04,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Pulsing sysinfo panel */
function SysInfoPanel() {
  const [metrics, setMetrics] = useState({
    cpu:  23,
    mem:  46,
    gpu:  8,
    disk: 30,
    temp: 51,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics({
        cpu:  15 + Math.floor(Math.random() * 45),
        mem:  43 + Math.floor(Math.random() * 8),
        gpu:  5  + Math.floor(Math.random() * 20),
        disk: 30,
        temp: 48 + Math.floor(Math.random() * 12),
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const rows = [
    { label: 'cpu',  val: `${metrics.cpu}%`,  barVal: metrics.cpu  },
    { label: 'mem',  val: `${metrics.mem}%`,  barVal: metrics.mem  },
    { label: 'gpu',  val: `${metrics.gpu}%`,  barVal: metrics.gpu  },
    { label: 'disk', val: `${metrics.disk}%`, barVal: metrics.disk },
  ];

  return (
    <div
      className="text-[10px] leading-[1.65]"
      style={{ fontFamily: 'var(--mono)', color: 'var(--text3)', whiteSpace: 'nowrap' }}
    >
      {rows.map(({ label, val, barVal }) => (
        <div key={label}>
          <span style={{ display: 'inline-block', width: 40 }}>{label}</span>
          <span style={{ color: 'var(--amber)', marginRight: 8 }}>{val}</span>
          <span style={{ color: 'var(--text3)' }}>{bar(barVal)}</span>
        </div>
      ))}
      <div>&nbsp;</div>
      <div>
        <span style={{ display: 'inline-block', width: 40 }}>temp</span>
        <span style={{ color: 'var(--amber)' }}>{metrics.temp}°C</span>
        <span style={{ color: 'var(--text2)', marginLeft: 8 }}>Ryzen 7 5800H</span>
      </div>
      <div>
        <span style={{ display: 'inline-block', width: 40 }}>uptime</span>
        <span style={{ color: 'var(--text2)' }}>47d 12h 09m</span>
      </div>
      <div>
        <span style={{ display: 'inline-block', width: 40 }}>load</span>
        <span style={{ color: 'var(--text2)' }}>0.72 0.81 0.94</span>
      </div>
      <div>
        <span style={{ display: 'inline-block', width: 40 }}>procs</span>
        <span style={{ color: 'var(--amber)' }}>241</span>
        <span style={{ color: 'var(--text3)', marginLeft: 8 }}>running</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TermPage() {
  return (
    <div
      className="grid gap-[14px]"
      style={{
        height: '100%',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '3fr 1fr',
      }}
    >

      {/* ── SHELL PANEL (top-left) ──────────────────────────── */}
      <Panel style={{ gridColumn: 1, gridRow: 1, position: 'relative' }} delay={0.1}>
        <MatrixCanvas />
        <PanelHead>
          <Dagger />{' '}
          <b style={{ color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 10 }}>zsh</b>
          <span className="text-[11px] normal-case tracking-normal" style={{ color: 'var(--text3)' }}>
            kitty — zaevo@OMEN-erde
          </span>
        </PanelHead>
        <PanelBody style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-[11px] leading-[1.75]" style={{ color: 'var(--text2)' }}>

            {/* fastfetch */}
            <div className="h-[6px]" />
            <ShellLine cmd="fastfetch" time="15:35:10" />
            <div style={{ color: 'var(--border2)' }}>┌─────────────────────────────────────────────────┐</div>
            {FASTFETCH_ROWS.map(({ k, v }) => (
              <div key={k} style={{ color: 'var(--text2)' }}>
                {'  '}
                <span style={{ display: 'inline-block', width: 88, color: 'var(--text3)' }}>{k}</span>
                <span style={{ color: 'var(--text)' }}>{v}</span>
              </div>
            ))}
            <div style={{ color: 'var(--border2)' }}>└─────────────────────────────────────────────────┘</div>

            {/* ll -a */}
            <div className="h-[6px]" />
            <ShellLine cmd="ll" flag=" -a" arg=" ~/repos/zaevotic" time="15:35:12" />
            <div className="mt-[4px]" style={{ color: 'var(--text2)', whiteSpace: 'pre', overflowX: 'hidden' }}>
              <div style={{ color: 'var(--text3)' }}>
                {`Permissions  Size User  Date Modified Git  Name`}
              </div>
              <div>
                {`drwxr-xr-x      - zaevo 29 Jun 17:11   --   `}
                <span style={{ color: 'var(--amber)' }}>.git</span>
              </div>
              <div>
                {`drwxr-xr-x      - zaevo 23 Jun 20:04   --   `}
                <span style={{ color: 'var(--amber)' }}>.github</span>
              </div>
              <div>
                {`.rw-r--r--      6 zaevo 23 Jun 20:04   --   `}
                <span style={{ color: 'var(--text2)' }}>.gitignore</span>
              </div>
              <div>
                {`drwxr-xr-x      - zaevo 13 Jul 14:25   --   `}
                <span style={{ color: 'var(--amber)' }}>.venv</span>
              </div>
              <div>
                {`drwxr-xr-x      - zaevo 23 Jun 19:49   --   `}
                <span style={{ color: 'var(--amber)' }}>cache</span>
              </div>
              <div>
                {`.rw-r--r--  5.3Ki zaevo 23 Jun 20:46   --   `}
                <span style={{ color: 'var(--text2)' }}>dark.svg</span>
              </div>
              <div>
                {`.rwxr-xr-x  1.9Mi zaevo  6 May 17:53   --   `}
                <span style={{ color: 'var(--text2)' }}>header.gif</span>
              </div>
              <div>
                {`.rw-r--r--  5.3Ki zaevo 23 Jun 20:44   --   `}
                <span style={{ color: 'var(--text2)' }}>light.svg</span>
              </div>
              <div>
                {`.rw-r--r--    170 zaevo 23 Jun 23:26   --   `}
                <span style={{ color: 'var(--text2)' }}>README.md</span>
              </div>
              <div>
                {`.rw-r--r--   15Ki zaevo 23 Jun 19:55   --   `}
                <span style={{ color: 'var(--red)' }}>update.py</span>
              </div>
            </div>

            {/* git log */}
            <div className="h-[6px]" />
            <ShellLine cmd="git" arg=" log" flag=" --oneline -5" time="15:35:14" />
            {GIT_LOG.map((entry) => (
              <div key={entry.hash}>
                <span style={{ color: entry.fresh ? 'var(--green)' : 'var(--text2)' }}>
                  {entry.hash}
                </span>{' '}
                <span style={{ color: 'var(--text2)' }}>{entry.msg}</span>
              </div>
            ))}

            {/* systemctl */}
            <div className="h-[6px]" />
            <ShellLine cmd="systemctl" flag=" --user" arg=" status pipewire" time="15:36:01" />
            <div>
              <span style={{ color: 'var(--green)' }}>● pipewire.service</span>
              <span style={{ color: 'var(--text2)' }}> - PipeWire Multimedia Service</span>
            </div>
            <div style={{ color: 'var(--text2)' }}>
              {'   Loaded: loaded (/usr/lib/systemd/user/pipewire.service)'}
            </div>
            <div style={{ color: 'var(--amber)' }}>
              {'   Active: active (running) since Mon 2025-11-18'}
            </div>
            <div className="h-[6px]" />
          </div>

          {/* Blinking cursor */}
          <div className="flex flex-col text-[11px] leading-[1.75]">
            <div style={{ color: 'var(--border2)' }}>┌──────&gt;</div>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <span style={{ color: 'var(--border2)' }}>│ </span>
                <span style={{ color: 'var(--red)', marginLeft: 4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <SiArchlinux className="text-[12px]" /> zaevo
                </span>
                <span style={{ color: 'var(--text2)', margin: '0 4px' }}>on</span>
                <span style={{ color: 'var(--amber)' }}>OMEN-erde</span>
                <span style={{ color: 'var(--text2)', margin: '0 4px' }}>at</span>
                <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MdHome className="text-[13px]" /> ~
                </span>
              </div>
              <span style={{ color: 'var(--text3)' }}>15:36:35</span>
            </div>
            <div className="flex gap-[6px] items-center">
              <span style={{ color: 'var(--border2)' }}>└─&gt;</span>
              <span
                style={{
                  display: 'inline-block',
                  width: 7, height: 14,
                  background: 'var(--red)',
                  verticalAlign: 'middle',
                  animation: 'cur-blink 1.1s step-end infinite',
                }}
              />
            </div>
          </div>
        </PanelBody>
      </Panel>

      {/* ── FILESYSTEM PANEL (top-right) ───────────────────────── */}
      <Panel style={{ gridColumn: 2, gridRow: 1 }} delay={0.2}>
        <PanelHead>
          <Dagger />{' '}
          <b style={{ color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 10 }}>fs</b>
          <span className="text-[11px] normal-case tracking-normal" style={{ color: 'var(--text3)' }}>
            ~/repos/zaevotic — tree
          </span>
        </PanelHead>
        <PanelBody>
          {/* cwd badge */}
          <div
            className="text-[10px] px-[8px] py-[4px] mb-[10px] border"
            style={{ color: 'var(--text3)', background: 'var(--bg2)', borderColor: 'var(--border)' }}
          >
            cwd:{' '}
            <span style={{ color: 'var(--amber)' }}>~/repos/zaevotic</span>
          </div>

          {/* Tree */}
          <div className="text-[11px] leading-[1.8]" style={{ fontFamily: 'var(--mono)' }}>
            {/* zaevotic */}
            <FsRow gutter="▾" name=".github/" type="dir" />
            <FsRow gutter="▾" name="workflows/" type="dir" indent={1} />
            <FsRow gutter="  " name="update.yml" type="file" indent={2} />
            <FsRow gutter="  " name=".gitignore" type="file" />
            <FsRow gutter="▾" name="cache/" type="dir" />
            <FsRow gutter="  " name="9e53f07edb42268fea5cb2798516a5fc9a98bc930f0d845b62d60f2f7bb31820.txt" type="file" indent={1} />
            <FsRow gutter="  " name="requirements.txt" type="file" indent={1} />
            <FsRow gutter="  " name="dark.svg" type="file" />
            <FsRow gutter="  " name="header.gif" type="file" />
            <FsRow gutter="  " name="light.svg" type="file" />
            <FsRow gutter="  " name="README.md" type="file" />
            <FsRow gutter="  " name="update.py" type="exec" />
          </div>
        </PanelBody>
      </Panel>

      {/* ── JOURNAL LOG PANEL (bottom-left) ──────────────────────── */}
      <Panel style={{ gridColumn: 1, gridRow: 2 }} delay={0.3}>
        <PanelHead>
          <Dagger />{' '}
          <b style={{ color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 10 }}>log</b>
          <span className="text-[11px] normal-case tracking-normal" style={{ color: 'var(--text3)' }}>
            journalctl -f
          </span>
        </PanelHead>
        <PanelBody style={{ padding: '10px 12px' }}>
          <JournalLog entries={JOURNAL_LOGS} />
        </PanelBody>
      </Panel>

      {/* ── SYSINFO PANEL (bottom-right) ─────────────────────────── */}
      <Panel style={{ gridColumn: 2, gridRow: 2 }} delay={0.4}>
        <PanelHead>
          <Dagger />{' '}
          <b style={{ color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 10 }}>sys</b>
          <span className="text-[11px] normal-case tracking-normal" style={{ color: 'var(--text3)' }}>
            sysinfo.live
          </span>
        </PanelHead>
        <PanelBody style={{ padding: '10px 12px' }}>
          <SysInfoPanel />
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
  type: 'dir' | 'file' | 'link' | 'exec';
  indent?: number;
  selected?: boolean;
}) {
  const COLOR = {
    dir:  'var(--amber)',
    file: 'var(--text2)',
    link: 'var(--green)',
    exec: 'var(--red)',
  };
  return (
    <div style={{ paddingLeft: indent * 14 }}>
      <span style={{ color: 'var(--border2)', marginRight: 4, userSelect: 'none' }}>
        {gutter}
      </span>
      <span
        style={{
          color: COLOR[type],
          background: selected ? 'var(--red-mute)' : undefined,
          padding: selected ? '0 4px' : undefined,
          borderRadius: selected ? 2 : undefined,
        }}
      >
        {name}
      </span>
    </div>
  );
}

function JournalLog({ entries }: { entries: LogEntry[] }) {
  // Use a static base date to prevent Next.js hydration mismatches between SSR and Client
  const baseTime = new Date('2026-07-13T15:36:35');
  return (
    <div className="flex flex-col gap-[2px]">
      {entries.map((e, i) => {
        const ts = new Date(baseTime.getTime() - (entries.length - 1 - i) * 3200);
        const hms = [ts.getHours(), ts.getMinutes(), ts.getSeconds()]
          .map((x) => String(x).padStart(2, '0'))
          .join(':');
        return (
          <div key={i} className="flex gap-[8px] text-[10px] leading-[1.7]">
            <span style={{ color: 'var(--text3)', flexShrink: 0 }}>{hms}</span>
            <span
              style={{
                width: 36,
                flexShrink: 0,
                color: LEVEL_COLOR[e.level],
              }}
            >
              {e.level.toUpperCase()}
            </span>
            <span style={{ color: 'var(--text2)' }}>{e.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
