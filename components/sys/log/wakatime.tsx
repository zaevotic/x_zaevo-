import React from 'react';

interface WakaBarProps {
  lang: string;
  pct: number; // 0-100
}

export default function WakaBar({ lang, pct }: WakaBarProps) {
  return (
    <div className="mb-[11px]">
      <div className="flex justify-between text-[11px] mb-[5px]">
        <span style={{ color: 'var(--text)' }}>{lang}</span>
        <span style={{ color: 'var(--text2)' }}>{pct}%</span>
      </div>
      <div
        className="h-[5px] border"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--red-dim), var(--red-ember))',
          }}
        />
      </div>
    </div>
  );
}
