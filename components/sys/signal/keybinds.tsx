"use client";

export default function KeybindsPanel() {
  const binds = [
    { keys: "Super + J", action: "toggle journal" },
    { keys: "Super + H/J/K/L", action: "focus window" },
    { keys: "Super + Shift + H/L", action: "move column" },
    { keys: "Super + N", action: "open launcher" },
    { keys: "Super + Return", action: "spawn kitty" },
    { keys: "Super + Q", action: "close window" },
    { keys: "Super + Space", action: "toggle panel" },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <p className="text-[9px] tracking-[.1em] text-[var(--text3)] mb-[10px]">
        ACTIVE BINDINGS
      </p>
      <div className="flex flex-col gap-[5px]">
        {binds.map((bind, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center text-[10px] bg-[var(--bg2)] border border-[var(--border)] rounded-[2px] px-[8px] py-[5px]"
          >
            <span style={{ color: "var(--amber)" }}>{bind.keys}</span>
            <span style={{ color: "var(--text3)" }}>{bind.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
