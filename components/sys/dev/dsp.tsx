import React from 'react';

interface StatRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  noBorder?: boolean;
}

export default function StatRow({ label, value, noBorder }: StatRowProps) {
  return (
    <div
      className="flex justify-between items-center py-[9px] text-[11px]"
      style={{
        borderBottom: noBorder ? 'none' : '1px solid var(--border)',
      }}
    >
      <span style={{ color: 'var(--text2)' }}>{label}</span>
      <span style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
