import React from "react";

interface SysMeterProps {
  label: string;
  value: number; // 0-100
}

export default function SysMeter({ label, value }: SysMeterProps) {
  return (
    <div className="flex items-center gap-[10px] mb-[10px] text-[11px]">
      <span className="w-[40px]" style={{ color: "var(--text2)" }}>
        {label}
      </span>
      <div
        className="flex-1 h-[6px] border"
        style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
      >
        <div
          className="h-full"
          style={{ width: `${value}%`, background: "var(--red)" }}
        />
      </div>
      <span className="w-[36px] text-right" style={{ color: "var(--text)" }}>
        {value}%
      </span>
    </div>
  );
}
