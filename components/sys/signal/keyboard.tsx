"use client";

import { useState, useEffect } from "react";

export default function KeyboardPanel() {
  const [activeCodes, setActiveCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveCodes((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveCodes((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };
    const handleBlur = () => setActiveCodes(new Set());

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const keyRows = [
    [
      { code: "Escape", label: "Esc", kind: "fn" },
      { code: "F1", label: "F1", kind: "fn" },
      { code: "F2", label: "F2", kind: "fn" },
      { code: "F3", label: "F3", kind: "fn" },
      { code: "F4", label: "F4", kind: "fn" },
      { code: "F5", label: "F5", kind: "fn" },
      { code: "F6", label: "F6", kind: "fn" },
      { code: "F7", label: "F7", kind: "fn" },
      { code: "F8", label: "F8", kind: "fn" },
      { code: "F9", label: "F9", kind: "fn" },
      { code: "F10", label: "F10", kind: "fn" },
      { code: "F11", label: "F11", kind: "fn" },
      { code: "F12", label: "F12", kind: "fn" },
    ],
    [
      { code: "Backquote", label: "`" },
      { code: "Digit1", label: "1" },
      { code: "Digit2", label: "2" },
      { code: "Digit3", label: "3" },
      { code: "Digit4", label: "4" },
      { code: "Digit5", label: "5" },
      { code: "Digit6", label: "6" },
      { code: "Digit7", label: "7" },
      { code: "Digit8", label: "8" },
      { code: "Digit9", label: "9" },
      { code: "Digit0", label: "0" },
      { code: "Minus", label: "-" },
      { code: "Equal", label: "=" },
      { code: "Backspace", label: "⌫", kind: "wide" },
    ],
    [
      { code: "Tab", label: "Tab", kind: "wide" },
      { code: "KeyQ", label: "q" },
      { code: "KeyW", label: "w" },
      { code: "KeyE", label: "e" },
      { code: "KeyR", label: "r" },
      { code: "KeyT", label: "t" },
      { code: "KeyY", label: "y" },
      { code: "KeyU", label: "u" },
      { code: "KeyI", label: "i" },
      { code: "KeyO", label: "o" },
      { code: "KeyP", label: "p" },
      { code: "BracketLeft", label: "[" },
      { code: "BracketRight", label: "]" },
      { code: "Backslash", label: "\\" },
    ],
    [
      { code: "CapsLock", label: "Caps", kind: "wider" },
      { code: "KeyA", label: "a" },
      { code: "KeyS", label: "s" },
      { code: "KeyD", label: "d" },
      { code: "KeyF", label: "f" },
      { code: "KeyG", label: "g" },
      { code: "KeyH", label: "h" },
      { code: "KeyJ", label: "j" },
      { code: "KeyK", label: "k" },
      { code: "KeyL", label: "l" },
      { code: "Semicolon", label: ";" },
      { code: "Quote", label: "'\''" },
      { code: "Enter", label: "↵", kind: "wider" },
    ],
    [
      { code: "ShiftLeft", label: "⇧", kind: "wider" },
      { code: "KeyZ", label: "z" },
      { code: "KeyX", label: "x" },
      { code: "KeyC", label: "c" },
      { code: "KeyV", label: "v" },
      { code: "KeyB", label: "b" },
      { code: "KeyN", label: "n" },
      { code: "KeyM", label: "m" },
      { code: "Comma", label: "," },
      { code: "Period", label: "." },
      { code: "Slash", label: "/" },
      { code: "ShiftRight", label: "⇧", kind: "wider" },
    ],
    [
      { code: "ControlLeft", label: "Ctrl", kind: "wide" },
      { code: "MetaLeft", label: "Super" },
      { code: "AltLeft", label: "Alt", kind: "wide" },
      { code: "Space", label: "", kind: "widest" },
      { code: "AltRight", label: "Alt", kind: "wide" },
      { code: "ControlRight", label: "Ctrl", kind: "wide" },
    ],
  ];

  const getKeyClasses = (key: any) => {
    let classes =
      "flex items-center justify-center border border-b-2 rounded-[3px] text-[9px] whitespace-nowrap select-none transition-all duration-75 ";

    if (key.kind === "fn")
      classes += "h-[22px] min-w-[24px] text-[9px] px-[2px] ";
    else if (key.kind === "wide") classes += "h-[28px] min-w-[46px] px-[4px] ";
    else if (key.kind === "wider") classes += "h-[28px] min-w-[58px] px-[4px] ";
    else if (key.kind === "widest")
      classes += "h-[28px] min-w-[120px] px-[4px] ";
    else classes += "h-[28px] min-w-[28px] px-[4px] ";

    if (activeCodes.has(key.code)) {
      classes +=
        "bg-[var(--red-mute)] border-[var(--red-dim)] border-b-[var(--red-dim)] text-[var(--red)] translate-y-[2px] border-b-0";
    } else {
      classes +=
        "bg-[var(--bg2)] border-[var(--border2)] border-b-[var(--border)] text-[var(--text3)]";
    }

    return classes;
  };

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="mb-[12px]">
        {keyRows.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-[3px] mb-[3px] justify-center">
            {row.map((k) => (
              <div key={k.code} className={getKeyClasses(k)}>
                {k.label}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-[9px] tracking-[.1em] text-[var(--text3)] mt-[10px]">
        LIVE INPUT FEED
      </p>
    </div>
  );
}
