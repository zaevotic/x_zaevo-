'use client';

import { useState } from 'react';
import Panel, { PanelHead, PanelBody, Dagger } from '@/components/ui/Panel';
import GithubHeatmap from '@/components/sys/log/github';
import WakaBar from '@/components/sys/log/wakatime';

// ── Data ──────────────────────────────────────────────────────────────────────

const FILTERS = ['all', 'in progress', 'shipped', 'open source'];

const PROJECTS = [
  {
    id: 'zaos',
    name: 'za0S',
    badge: 'research',
    desc: 'Custom OS architecture with a 3-layer semantic filesystem model, xattr integration, and real x86 implementation planning.',
    why: [
      <>Every filesystem I&apos;d used treated metadata as an afterthought — I wanted meaning to live <b style={{ color: 'var(--red-ember)', fontWeight: 500 }}>at the kernel boundary</b>, not bolted on top of it.</>,
      'Challenge: designing a semantic layer that stays independent of any specific runtime or agent.',
      <>Learned: the hard part was never the code — it was <b style={{ color: 'var(--red-ember)', fontWeight: 500 }}>deciding what the filesystem is allowed to assume</b>.</>,
    ],
    stack: ['Rust', 'C', 'systems'],
    status: 'wip',
  },
  {
    id: 'svg-readme',
    name: 'svg-readme-gen',
    badge: 'shipped',
    desc: 'Animated SVG GitHub profile that mimics fastfetch/neofetch layout with live GraphQL stats injection and GitHub Actions automation.',
    why: [
      <>Wanted a GitHub profile that felt like <b style={{ color: 'var(--red-ember)', fontWeight: 500 }}>my actual terminal</b>, not a template with my name swapped in.</>,
      'Learned: good API design is 90% of the work — wiring GraphQL stats into a live-updating SVG took 3 rewrites to get right.',
    ],
    stack: ['Python', 'SVG', 'tooling'],
    status: 'shipped',
  },
  {
    id: 'terminal-portfolio',
    name: 'terminal-portfolio',
    badge: 'shipped',
    desc: 'Self-contained terminal portfolio page. Unified filesystem panel, vim-style file viewer tabs, live keyboard panel, floating syslog.',
    why: [
      'A terminal that looks right is easier to work in — taste is a forcing function, it makes you care about the detail.',
    ],
    stack: ['TypeScript', 'Tauri', 'web'],
    status: 'oss',
  },
];

const WAKA = [
  { lang: 'Rust',       pct: 34.1 },
  { lang: 'Python',     pct: 24.5 },
  { lang: 'TypeScript', pct: 17.6 },
  { lang: 'QML',        pct: 11.3 },
  { lang: 'Bash',       pct: 4.7  },
];

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  shipped:  { color: '#7a9', border: '1px solid #2a4a35' },
  wip:      { color: 'var(--red-ember)', border: '1px solid var(--border2)' },
  research: { color: 'var(--red-ember)', border: '1px solid var(--border2)' },
  oss:      { color: 'var(--red-ember)', border: '1px solid var(--border2)' },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-[8px] mb-[16px]">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-[14px] py-[7px] text-[10px] tracking-[1px] uppercase border transition-colors cursor-pointer"
            style={{
              borderColor: activeFilter === f ? 'var(--red)' : 'var(--border2)',
              color: activeFilter === f ? 'var(--red-ember)' : 'var(--text2)',
              background: activeFilter === f ? 'rgba(182,24,43,0.08)' : 'transparent',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div
        className="grid gap-[14px]"
        style={{ gridTemplateColumns: '1fr 1fr' }}
      >
        {/* Left — project cards */}
        <div className="flex flex-col gap-[14px]">
          {PROJECTS.map((p) => (
            <Panel key={p.id}>
              <PanelHead
                meta={
                  <span
                    className="text-[9px] tracking-[0.5px] uppercase px-[7px] py-[3px]"
                    style={BADGE_STYLES[p.status]}
                  >
                    {p.badge}
                  </span>
                }
              >
                <Dagger /> <b style={{ color: 'var(--text)' }}>{p.name}</b>
              </PanelHead>
              <PanelBody>
                <p className="text-[12px] leading-[1.6] mb-[12px]" style={{ color: 'var(--text2)' }}>
                  {p.desc}
                </p>
                {/* Why section */}
                <div
                  className="border-t pt-[10px] mt-[4px]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <p
                    className="text-[10px] tracking-[1.5px] uppercase mb-[8px]"
                    style={{ color: 'var(--red)' }}
                  >
                    // why i built it
                  </p>
                  {p.why.map((line, i) => (
                    <p
                      key={i}
                      className="text-[11px] leading-[1.6] mb-[6px] pl-[14px] relative"
                      style={{ color: 'var(--text)', opacity: 0.85 }}
                    >
                      <span
                        className="absolute left-0"
                        style={{ color: 'var(--red-dim)' }}
                      >
                        →
                      </span>
                      {line}
                    </p>
                  ))}
                </div>
                {/* Stack chips */}
                <div className="flex gap-[6px] mt-[12px]">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="text-[9px] px-[8px] py-[3px] border"
                      style={{ color: 'var(--text2)', borderColor: 'var(--border)' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </PanelBody>
            </Panel>
          ))}
        </div>

        {/* Right — heatmap + wakatime */}
        <div className="flex flex-col gap-[14px]">
          {/* GitHub heatmap */}
          <Panel>
            <PanelHead>
              <Dagger /> <b style={{ color: 'var(--text)' }}>GH</b> github_heatmap.svg
            </PanelHead>
            <PanelBody>
              <GithubHeatmap />
            </PanelBody>
          </Panel>

          {/* Wakatime */}
          <Panel>
            <PanelHead meta="142h 18m / 30d">
              <Dagger /> <b style={{ color: 'var(--text)' }}>WAKA</b> wakatime.log
            </PanelHead>
            <PanelBody>
              {WAKA.map((w, i) => (
                <div key={w.lang} style={{ marginBottom: i === WAKA.length - 1 ? 0 : undefined }}>
                  <WakaBar lang={w.lang} pct={w.pct} />
                </div>
              ))}
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}
