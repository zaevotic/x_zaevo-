'use client';

import { useState, useEffect } from 'react';

export default function SpotifyPanel() {
  const [spPct, setSpPct] = useState(38);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSpPct((prev) => Math.min(100, prev + (100 / (4 * 60))));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const total = 247; // 4:07
  const elapsed = Math.round(total * spPct / 100);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const curTime = `${m}:${s < 10 ? '0' : ''}${s}`;

  return (
    <div className="flex flex-col h-full">
      <div 
        className="w-full max-w-[200px] aspect-square rounded-[3px] mb-[14px] flex items-center justify-center relative overflow-hidden border"
        style={{ background: 'var(--bg3)', borderColor: 'var(--border2)' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full flex items-center justify-center animate-[spin_8s_linear_infinite]"
            style={{ 
              width: 110, 
              height: 110,
              background: `conic-gradient(
                var(--bg) 0deg, var(--border) 20deg, var(--bg) 40deg,
                var(--border2) 80deg, var(--bg) 120deg, var(--border) 160deg,
                var(--bg) 200deg, var(--border2) 240deg, var(--bg) 280deg,
                var(--border) 320deg, var(--bg) 360deg
              )`
            }}
          >
            <div 
              className="rounded-full border-[2px]" 
              style={{ width: 28, height: 28, background: 'var(--bg1)', borderColor: 'var(--red-dim)' }}
            />
          </div>
        </div>
      </div>
      
      <p className="text-[13px] mb-[3px]" style={{ color: 'var(--text)' }}>Something About Us</p>
      <p className="text-[11px] mb-[12px]" style={{ color: 'var(--text3)' }}>Daft Punk · Discovery</p>
      
      <div className="h-[3px] rounded-[2px] mb-[6px] relative" style={{ background: 'var(--border)' }}>
        <div 
          className="h-full rounded-[2px] transition-all duration-1000 ease-linear" 
          style={{ width: `${spPct}%`, background: 'var(--red)' }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] mb-[14px]" style={{ color: 'var(--text3)' }}>
        <span>{curTime}</span>
        <span>4:07</span>
      </div>
      
      <div className="flex items-center gap-[16px]">
        <button className="text-[14px] cursor-pointer hover:text-[var(--text)] transition-colors bg-transparent border-none font-mono" style={{ color: 'var(--text3)' }}>⏮</button>
        <button className="text-[16px] cursor-pointer bg-transparent border-none font-mono" style={{ color: 'var(--red)' }}>▶</button>
        <button className="text-[14px] cursor-pointer hover:text-[var(--text)] transition-colors bg-transparent border-none font-mono" style={{ color: 'var(--text3)' }}>⏭</button>
        <button className="text-[11px] cursor-pointer hover:text-[var(--text)] transition-colors bg-transparent border-none font-mono ml-auto" style={{ color: 'var(--text3)' }}>♡</button>
      </div>
      
      <p className="text-[9px] tracking-[.1em] mt-[14px] mb-[6px]" style={{ color: 'var(--text3)' }}>QUEUE</p>
      
      <div className="flex flex-col">
        <div className="flex justify-between text-[10px] py-[4px] border-b" style={{ color: 'var(--text2)', borderColor: 'var(--border)' }}>
          <span>Instant Crush — Daft Punk</span>
          <span style={{ color: 'var(--text3)' }}>5:37</span>
        </div>
        <div className="flex justify-between text-[10px] py-[4px] border-b" style={{ color: 'var(--text2)', borderColor: 'var(--border)' }}>
          <span>Get Lucky — Daft Punk</span>
          <span style={{ color: 'var(--text3)' }}>6:09</span>
        </div>
        <div className="flex justify-between text-[10px] py-[4px]" style={{ color: 'var(--text2)' }}>
          <span>Harder, Better — Daft Punk</span>
          <span style={{ color: 'var(--text3)' }}>3:44</span>
        </div>
      </div>
    </div>
  );
}
