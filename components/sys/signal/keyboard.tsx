'use client';

import { useState, useEffect } from 'react';

export default function KeyboardPanel() {
  const [flashedKey, setFlashedKey] = useState<number | null>(null);

  // Define keys for the grid to easily manage flashing logic
  const keyRows = [
    [
      { id: 1, label: 'Esc', kind: 'fn' },
      { id: 2, label: 'F1', kind: 'fn' }, { id: 3, label: 'F2', kind: 'fn' }, { id: 4, label: 'F3', kind: 'fn' }, { id: 5, label: 'F4', kind: 'fn' },
      { id: 6, label: 'F5', kind: 'fn' }, { id: 7, label: 'F6', kind: 'fn' }, { id: 8, label: 'F7', kind: 'fn' }, { id: 9, label: 'F8', kind: 'fn' },
      { id: 10, label: 'F9', kind: 'fn' }, { id: 11, label: 'F10', kind: 'fn' }, { id: 12, label: 'F11', kind: 'fn' }, { id: 13, label: 'F12', kind: 'fn' },
    ],
    [
      { id: 14, label: '`' }, { id: 15, label: '1' }, { id: 16, label: '2' }, { id: 17, label: '3' },
      { id: 18, label: '4' }, { id: 19, label: '5' }, { id: 20, label: '6' }, { id: 21, label: '7' },
      { id: 22, label: '8' }, { id: 23, label: '9' }, { id: 24, label: '0' },
      { id: 25, label: '-' }, { id: 26, label: '=' }, { id: 27, label: '⌫', kind: 'wide' },
    ],
    [
      { id: 28, label: 'Tab', kind: 'wide' },
      { id: 29, label: 'q' }, { id: 30, label: 'w' }, { id: 31, label: 'e' }, { id: 32, label: 'r' },
      { id: 33, label: 't' }, { id: 34, label: 'y' }, { id: 35, label: 'u' }, { id: 36, label: 'i' },
      { id: 37, label: 'o' }, { id: 38, label: 'p' }, { id: 39, label: '[' }, { id: 40, label: ']' }, { id: 41, label: '\\' },
    ],
    [
      { id: 42, label: 'Caps', kind: 'wider' },
      { id: 43, label: 'a' }, { id: 44, label: 's', alwaysActive: true }, { id: 45, label: 'd' }, { id: 46, label: 'f' },
      { id: 47, label: 'g' }, { id: 48, label: 'h' }, { id: 49, label: 'j' }, { id: 50, label: 'k' },
      { id: 51, label: 'l' }, { id: 52, label: ';' }, { id: 53, label: "'\''" }, { id: 54, label: '↵', kind: 'wider' },
    ],
    [
      { id: 55, label: '⇧', kind: 'wider' },
      { id: 56, label: 'z' }, { id: 57, label: 'x' }, { id: 58, label: 'c' }, { id: 59, label: 'v' },
      { id: 60, label: 'b' }, { id: 61, label: 'n', alwaysActive: true }, { id: 62, label: 'm' },
      { id: 63, label: ',' }, { id: 64, label: '.' }, { id: 65, label: '/' }, { id: 66, label: '⇧', kind: 'wider' },
    ],
    [
      { id: 67, label: 'Ctrl', kind: 'wide' },
      { id: 68, label: 'Super', alwaysActive: true },
      { id: 69, label: 'Alt', kind: 'wide' },
      { id: 70, label: '', kind: 'widest' },
      { id: 71, label: 'Alt', kind: 'wide' },
      { id: 72, label: 'Ctrl', kind: 'wide' },
    ]
  ];

  const flashableIds = keyRows.flat().filter(k => !k.alwaysActive).map(k => k.id);

  useEffect(() => {
    const flashInterval = setInterval(() => {
      const randomId = flashableIds[Math.floor(Math.random() * flashableIds.length)];
      setFlashedKey(randomId);
      setTimeout(() => setFlashedKey(null), 180);
    }, 400);
    return () => clearInterval(flashInterval);
  }, []);

  const getKeyClasses = (key: any) => {
    let classes = "flex items-center justify-center border border-b-2 rounded-[3px] text-[9px] whitespace-nowrap select-none transition-all duration-[80ms] ";
    
    // Size logic
    if (key.kind === 'fn') classes += "h-[22px] min-w-[24px] text-[8px] px-[4px] ";
    else if (key.kind === 'wide') classes += "h-[28px] min-w-[46px] px-[4px] ";
    else if (key.kind === 'wider') classes += "h-[28px] min-w-[58px] px-[4px] ";
    else if (key.kind === 'widest') classes += "h-[28px] min-w-[120px] px-[4px] ";
    else classes += "h-[28px] min-w-[28px] px-[4px] ";

    // Color logic
    if (key.alwaysActive || flashedKey === key.id) {
      classes += "bg-[var(--red-mute)] border-[var(--red-dim)] border-b-[var(--red-dim)] text-[var(--red)]";
    } else {
      classes += "bg-[var(--bg2)] border-[var(--border2)] border-b-[var(--border)] text-[var(--text3)] hover:bg-[var(--bg3)] hover:text-[var(--text2)]";
    }

    return classes;
  };

  return (
    <div className="flex flex-col">
      <div className="mb-[12px]">
        {keyRows.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-[3px] mb-[3px] justify-center">
            {row.map((k) => (
              <div key={k.id} className={getKeyClasses(k)}>
                {k.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-[9px] tracking-[.1em] text-[var(--text3)] my-[6px]">ACTIVE BINDINGS</p>
      
      {[
        { keys: 'Super + H/J/K/L', action: 'focus window' },
        { keys: 'Super + Shift + H/L', action: 'move column' },
        { keys: 'Super + N', action: 'open launcher' },
        { keys: 'Super + Return', action: 'spawn kitty' },
        { keys: 'Super + Q', action: 'close window' },
        { keys: 'Super + Space', action: 'toggle panel' },
      ].map((bind, idx) => (
        <div key={idx} className="flex justify-between items-center text-[10px] bg-[var(--bg2)] border border-[var(--border)] rounded-[2px] px-[8px] py-[5px] mb-[5px]">
          <span style={{ color: 'var(--amber)' }}>{bind.keys}</span>
          <span style={{ color: 'var(--text3)' }}>{bind.action}</span>
        </div>
      ))}
    </div>
  );
}
