'use client';

import { useState } from 'react';
import Panel, { PanelHead, PanelBody, Dagger } from '@/components/ui/Panel';

// ── Data ──────────────────────────────────────────────────────────────────────

const ENTRIES = [
  {
    id: '01',
    title: 'Designing a Semantic Filesystem Without an Agent',
    tags: ['systems', 'filesystems'],
    date: '2025-11-12',
    body: [
      'Why the semantic layer in zaOS lives independently of any AI runtime, and how xattr can carry meaning at the kernel boundary without special-casing anything.',
      'Most "smart" filesystems solve this by pushing understanding into an agent that sits above the fs layer. That felt backwards — the meaning should be recoverable even if nothing intelligent is running.',
    ],
    callout: 'Abstractions should earn their keep. Every layer costs something — latency, debuggability, mental model space. I only reach for one when the complexity it hides is genuinely worse than the complexity it introduces.',
  },
  {
    id: '02',
    title: 'Niri Is What I Wanted Sway to Be',
    tags: ['wayland'],
    date: '2025-10-28',
    body: [
      'Scrollable tiling, per-workspace layouts, and IPC that actually makes sense. Niri got the things right that Sway left awkward.',
    ],
    callout: null,
  },
  {
    id: '03',
    title: 'Generating Animated SVGs with GitHub Actions',
    tags: ['tooling'],
    date: '2025-09-14',
    body: [
      "The interesting part wasn't the SVG — it was designing a data pipeline that stays fast enough to run on every push without hitting API rate limits.",
    ],
    callout: null,
  },
  {
    id: '04',
    title: 'Why I Reach for Rust on Side Projects Now',
    tags: ['rust'],
    date: '2025-08-02',
    body: [
      "It's not the speed. It's that the compiler forces you to think about ownership before you write the bug. The model is annoying until it isn't.",
    ],
    callout: null,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [selected, setSelected] = useState(ENTRIES[0]);

  return (
    <div
      className="grid gap-[14px]"
      style={{ gridTemplateColumns: '320px 1fr' }}
    >
      {/* Entry list */}
      <Panel>
        <PanelHead>
          <Dagger /> <b style={{ color: 'var(--text)' }}>JOURNAL_ENTRIES</b>
        </PanelHead>
        <div>
          {ENTRIES.map((e) => {
            const active = e.id === selected.id;
            return (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="w-full text-left px-[14px] py-[12px] border-b cursor-pointer transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  borderLeft: active ? '2px solid var(--red)' : '2px solid transparent',
                  background: active ? 'rgba(182,24,43,0.08)' : 'transparent',
                }}
              >
                <div
                  className="text-[9px] tracking-[1px] uppercase mb-[5px]"
                  style={{ color: 'var(--red-dim)' }}
                >
                  {e.id}
                </div>
                <div
                  className="text-[12px] leading-[1.4] mb-[7px]"
                  style={{ color: 'var(--text)' }}
                >
                  {e.title}
                </div>
                <div className="flex gap-[6px]">
                  {e.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-[6px] py-[2px] border"
                      style={{ color: 'var(--text2)', borderColor: 'var(--border)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* Reader */}
      <Panel>
        <PanelHead meta={selected.date}>
          <Dagger /> <b style={{ color: 'var(--text)' }}>~/CONTENTS</b>
        </PanelHead>
        <PanelBody>
          {/* Journal h1 — Pirata One per CLAUDE.md */}
          <h1
            className="text-[30px] leading-none mb-[16px]"
            style={{
              fontFamily: 'var(--display)',
              color: 'var(--text)',
              fontWeight: 400,
            }}
          >
            {selected.title}
          </h1>
          {selected.body.map((para, i) => (
            <p
              key={i}
              className="text-[12px] leading-[1.85] mb-[12px]"
              style={{ color: 'var(--text)', opacity: 0.85 }}
            >
              {para}
            </p>
          ))}
          {selected.callout && (
            <blockquote
              className="border-l-2 pl-[14px] my-[16px] text-[11px] leading-[1.75]"
              style={{ borderColor: 'var(--red)', color: 'var(--text2)' }}
            >
              {selected.callout}
            </blockquote>
          )}
        </PanelBody>
      </Panel>
    </div>
  );
}
