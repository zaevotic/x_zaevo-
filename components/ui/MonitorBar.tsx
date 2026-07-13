'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TABS = [
  { num: '1', label: 'home',    href: '/home' },
  { num: '2', label: 'work',    href: '/work' },
  { num: '3', label: 'journal', href: '/journal' },
  { num: '4', label: 'term',    href: '/term' },
  { num: '5', label: 'contact', href: '/contact' },
  { num: '6', label: 'signal',  href: '/signal' },
];

export default function MonitorBar() {
  const pathname = usePathname();
  const [clock, setClock] = useState('00:00:00');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-[16px] h-[36px] border-b sticky top-0 z-50 flex-shrink-0"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--bg1)',
      }}
    >
      {/* ── Left ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-[12px] flex-1">
        {/* Brand */}
        <div className="flex items-center gap-[8px]">
          <span
            className="flex-shrink-0"
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              background: 'var(--red)',
              clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
              boxShadow: '0 0 12px var(--red-ember)',
            }}
          />
          <span
            className="text-[13px] font-bold tracking-[0.08em]"
            style={{ color: 'var(--red)' }}
          >
            zaevo
          </span>
        </div>

        {/* Separator */}
        <span className="text-[13px]" style={{ color: 'var(--border2)' }}>
          │
        </span>

        {/* Workspace tabs */}
        <nav className="flex gap-[4px]">
          {TABS.map(({ num, label, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className="relative text-[13px] px-[10px] py-[4px] rounded-[4px] transition-colors duration-100 tracking-[0.02em]"
                style={{
                  color: active ? 'var(--red)' : 'var(--text3)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--text2)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--text3)';
                }}
              >
                {active && (
                  <motion.div
                    layoutId="active-workspace"
                    className="absolute inset-0 rounded-[4px]"
                    style={{ background: 'var(--red-mute)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{num}:{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Right ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-[16px]">
        <span
          className="text-[12px] tracking-[0.1em]"
          style={{ color: 'var(--text3)' }}
        >
          OMEN-erde
        </span>
        <span
          className="text-[13px] tracking-[0.05em] tabular-nums"
          style={{ color: 'var(--text3)' }}
        >
          {clock}
        </span>
      </div>
    </header>
  );
}
