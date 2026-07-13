'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [data-cursor], .tab, .jentry, .filter';

function useIsFinePointer() {
  const [fine, setFine] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const handler = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return fine;
}

export default function CustomCursor() {
  const isFine = useIsFinePointer();

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  
  // The dot and text caret should track 1:1 with hardware without ANY physics to prevent stutter
  const dotX = rawX;
  const dotY = rawY;

  // Buttery trailing ring (even softer)
  const ringX = useSpring(rawX, { stiffness: 100, damping: 25, mass: 0.1 });
  const ringY = useSpring(rawY, { stiffness: 100, damping: 25, mass: 0.1 });

  // Focus-ring target rect, spring-eased so it "snaps" like a WM border
  const boxX = useSpring(0, { stiffness: 500, damping: 40 });
  const boxY = useSpring(0, { stiffness: 500, damping: 40 });
  const boxW = useSpring(0, { stiffness: 500, damping: 40 });
  const boxH = useSpring(0, { stiffness: 500, damping: 40 });

  const [mode, setMode] = useState("idle"); // idle | focus | text
  const [label, setLabel] = useState("");
  const [pulse, setPulse] = useState(false);
  const lastTarget = useRef<HTMLElement | null>(null);

  const PAD = 6;

  const applyTarget = useCallback((el: HTMLElement | null) => {
    if (!el) {
      setMode("idle");
      setLabel("");
      lastTarget.current = null;
      return;
    }
    const isTextish =
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.dataset.cursor === "text" ||
      el.isContentEditable;

    const rect = el.getBoundingClientRect();
    boxX.set(rect.left - PAD);
    boxY.set(rect.top - PAD);
    boxW.set(rect.width + PAD * 2);
    boxH.set(rect.height + PAD * 2);

    setMode(isTextish ? "text" : "focus");
    setLabel(el.dataset.cursorLabel || "");
    lastTarget.current = el;
  }, [boxX, boxY, boxW, boxH]);

  useEffect(() => {
    if (!isFine) return;

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);

      const target = e.target as HTMLElement;
      const el = target.closest ? (target.closest(INTERACTIVE_SELECTOR) as HTMLElement) : null;
      
      if (el !== lastTarget.current) applyTarget(el);
    };

    const onScroll = () => {
      if (lastTarget.current) applyTarget(lastTarget.current);
    };

    const onDown = () => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 260);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("mousedown", onDown);
    };
  }, [isFine, rawX, rawY, applyTarget, boxX, boxY, boxW, boxH]);

  if (!isFine) return null; // let touch devices use their native pointer

  const cornerColor = pulse ? 'var(--red-ember)' : 'var(--red)';
  const cornerLen = 10;
  const cornerThick = 2;

  const cornerStyle = (pos: 'tl'|'tr'|'bl'|'br'): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: cornerLen,
      height: cornerLen,
      transition: "border-color 120ms linear",
    };
    const b = `${cornerThick}px solid ${cornerColor}`;
    if (pos === "tl") return { ...base, top: 0, left: 0, borderTop: b, borderLeft: b };
    if (pos === "tr") return { ...base, top: 0, right: 0, borderTop: b, borderRight: b };
    if (pos === "bl") return { ...base, bottom: 0, left: 0, borderBottom: b, borderLeft: b };
    if (pos === "br") return { ...base, bottom: 0, right: 0, borderBottom: b, borderRight: b };
    return base;
  };

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99999 }}>
      
      {/* IDLE: Dot */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: mode === "idle" ? 1 : 0,
          scale: pulse ? 1.5 : 1,
          transition: "opacity 120ms linear",
          width: 8,
          height: 8,
          backgroundColor: '#ff2436', // var(--red-ember) fallback
          boxShadow: '0 0 8px #ff2436',
          borderRadius: '50%',
        }}
      />

      {/* IDLE: Ring */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: mode === "idle" ? 1 : 0,
          scale: pulse ? 0.8 : 1,
          transition: "opacity 120ms linear",
          width: 28,
          height: 28,
          border: '2px solid var(--red)',
          borderRadius: '50%',
        }}
      />

      {/* text-field caret */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: mode === "text" ? 1 : 0,
          transition: "opacity 120ms linear",
        }}
      >
        <div
          style={{
            width: 2,
            height: 22,
            background: 'var(--amber)',
            animation: "termcursor-blink 0.9s steps(1) infinite",
            boxShadow: `0 0 8px rgba(196,124,46,0.5)`,
          }}
        />
      </motion.div>

      {/* focus-ring (WM-style corner brackets) */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: boxX,
          y: boxY,
          width: boxW,
          height: boxH,
          opacity: mode === "focus" ? 1 : 0,
          scale: pulse ? 1.06 : 1,
          transition: "opacity 140ms linear", // scale is handled by motion automatically if used in animate= or left alone if static
        }}
        transition={{ scale: { duration: 0.18, ease: "easeOut" } }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <div style={cornerStyle("tl")} />
          <div style={cornerStyle("tr")} />
          <div style={cornerStyle("bl")} />
          <div style={cornerStyle("br")} />
          {label ? (
            <div
              style={{
                position: "absolute",
                bottom: -22,
                left: 0,
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                color: 'var(--amber)',
                whiteSpace: "nowrap",
              }}
            >
              [{label}]
            </div>
          ) : null}
        </div>
      </motion.div>

      <style>{`
        @keyframes termcursor-blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
