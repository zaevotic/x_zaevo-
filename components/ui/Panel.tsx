'use client';

import React from 'react';

import { motion } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PanelProps {
  children: React.ReactNode;
  cut?: boolean; // deprecated but kept for backwards comp
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

interface PanelHeadProps {
  children: React.ReactNode;
  meta?: React.ReactNode;
}

interface PanelBodyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// ── Sub-components ────────────────────────────────────────────────────────────

export function PanelHead({ children, meta }: PanelHeadProps) {
  return (
    <div
      className="flex items-center justify-between px-[14px] py-[9px] border-b shrink-0 z-10"
      style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}
    >
      <div
        className="flex items-center gap-[8px] text-[10px] tracking-[1.5px] uppercase"
        style={{ color: 'var(--text2)' }}
      >
        {children}
      </div>
      {meta && (
        <div className="text-[10px]" style={{ color: 'var(--text3)' }}>
          {meta}
        </div>
      )}
    </div>
  );
}

export function PanelBody({ children, className = '', style }: PanelBodyProps) {
  return (
    <div
      className={`flex-1 min-h-0 overflow-auto p-[16px] z-10 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function Dagger() {
  return <span style={{ color: 'var(--red)', fontSize: '12px' }}>†</span>;
}

// ── Panel (default export) ──────────────────────────────────────────────────

export default function Panel({ children, cut = true, className = '', style, delay = 0 }: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1], // premium custom easeOut
        delay: delay 
      }}
      className={`panel ${cut ? 'cut' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </motion.div>
  );
}