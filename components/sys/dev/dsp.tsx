import React from "react";

interface StatRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  noBorder?: boolean;
}

export default function StatRow({ label, value, noBorder }: StatRowProps) {
  return (
    <div
      className="flex justify-between items-center py-[9px] text-[11px] min-w-0"
      style={{
        borderBottom: noBorder ? "none" : "1px solid var(--border)",
      }}
    >
      <span style={{ color: "var(--text2)", flexShrink: 0 }}>{label}</span>
      <span
        className="truncate ml-[16px] min-w-0 flex-1 text-right"
        style={{ color: "var(--text)" }}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}
