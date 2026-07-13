import React from 'react';

interface KbdProps {
  children: React.ReactNode;
}

export default function Kbd({ children }: KbdProps) {
  return (
    <span
      className="inline-flex items-center px-[7px] py-[3px] text-[10px] border"
      style={{
        background: 'var(--bg2)',
        borderColor: 'var(--border2)',
        color: 'var(--text2)',
        fontFamily: 'var(--mono)',
      }}
    >
      {children}
    </span>
  );
}
