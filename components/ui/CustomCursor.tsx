"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

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

function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

export default function CustomCursor() {
  const isFine = useIsFinePointer();

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const mouseX = useRef(-100);
  const mouseY = useRef(-100);
  const ringX = useRef(-100);
  const ringY = useRef(-100);
  const focusX = useRef(-100);
  const focusY = useRef(-100);

  const mode = useRef<"idle" | "focus" | "text">("idle");
  const isMouseDown = useRef(false);
  const [label, setLabel] = useState("");
  const lastTarget = useRef<HTMLElement | null>(null);

  const [pulse, setPulse] = useState(false);

  const applyTarget = useCallback((el: HTMLElement | null) => {
    if (!el) {
      if (mode.current !== "idle") {
        if (focusRef.current) {
          // Collapse box into the mouse pointer as it fades out
          focusRef.current.style.width = `8px`;
          focusRef.current.style.height = `8px`;
          focusRef.current.style.transform = `translate(${mouseX.current - 4}px, ${mouseY.current - 4}px) scale(0.5)`;
        }
      }
      mode.current = "idle";
      setLabel("");
      lastTarget.current = null;
      return;
    }

    const isTextish =
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.dataset.cursor === "text" ||
      el.isContentEditable;

    const PAD = 6;
    const rect = el.getBoundingClientRect();

    if (focusRef.current) {
      const w = rect.width + PAD * 2;
      const h = rect.height + PAD * 2;

      if (mode.current === "idle") {
        // Teleport the focus box to the mouse so it expands seamlessly OUTWARDS
        focusRef.current.style.transition = "none";
        focusRef.current.style.width = `8px`;
        focusRef.current.style.height = `8px`;
        focusRef.current.style.transform = `translate(${mouseX.current - 4}px, ${mouseY.current - 4}px) scale(0.5)`;

        void focusRef.current.offsetWidth; // Force CSS reflow

        focusRef.current.style.transition =
          "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
      }

      focusX.current = rect.left - PAD;
      focusY.current = rect.top - PAD;

      focusRef.current.style.width = `${w}px`;
      focusRef.current.style.height = `${h}px`;
      focusRef.current.style.transform = `translate(${focusX.current}px, ${focusY.current}px) scale(${isMouseDown.current ? 1.06 : 1})`;
    }

    mode.current = isTextish ? "text" : "focus";
    setLabel(el.dataset.cursorLabel || "");
    lastTarget.current = el;
  }, []);

  useEffect(() => {
    if (!isFine) return;

    let animationFrameId: number;

    function animateCursor() {
      ringX.current = lerp(ringX.current, mouseX.current, 0.15);
      ringY.current = lerp(ringY.current, mouseY.current, 0.15);

      const scaleDot = isMouseDown.current ? 1.5 : 1;
      const scaleRing = isMouseDown.current ? 0.8 : 1;

      if (mode.current === "idle") {
        if (dotRef.current) {
          dotRef.current.style.opacity = "1";
          dotRef.current.style.transform = `translate(calc(${mouseX.current}px - 50%), calc(${mouseY.current}px - 50%)) scale(${scaleDot})`;
        }
        if (ringRef.current) {
          ringRef.current.style.opacity = "1";
          ringRef.current.style.transform = `translate(calc(${ringX.current}px - 50%), calc(${ringY.current}px - 50%)) scale(${scaleRing})`;
        }
        if (focusRef.current) focusRef.current.style.opacity = "0";
        if (textRef.current) textRef.current.style.opacity = "0";
      } else if (mode.current === "focus") {
        if (dotRef.current) dotRef.current.style.opacity = "0";
        if (ringRef.current) ringRef.current.style.opacity = "0";
        if (textRef.current) textRef.current.style.opacity = "0";

        if (focusRef.current) {
          focusRef.current.style.opacity = "1";
          focusRef.current.style.transform = `translate(${focusX.current}px, ${focusY.current}px) scale(${isMouseDown.current ? 1.06 : 1})`;
        }
      } else if (mode.current === "text") {
        if (dotRef.current) dotRef.current.style.opacity = "0";
        if (ringRef.current) ringRef.current.style.opacity = "0";

        if (focusRef.current) {
          focusRef.current.style.opacity = "1";
          focusRef.current.style.transform = `translate(${focusX.current}px, ${focusY.current}px) scale(${isMouseDown.current ? 1.06 : 1})`;
        }

        if (textRef.current) {
          textRef.current.style.opacity = "1";
          textRef.current.style.transform = `translate(calc(${mouseX.current}px - 50%), calc(${mouseY.current}px - 50%))`;
        }
      }

      animationFrameId = requestAnimationFrame(animateCursor);
    }

    animateCursor();

    let isKeyboardNav = false;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key.startsWith("Arrow")) {
        isKeyboardNav = true;
      }
    };

    const onMove = (e: MouseEvent) => {
      isKeyboardNav = false;
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;

      const target = e.target as HTMLElement;
      const el = target.closest
        ? (target.closest(INTERACTIVE_SELECTOR) as HTMLElement)
        : null;

      if (el !== lastTarget.current) {
        applyTarget(el);
      }
    };

    const onScroll = () => {
      if (lastTarget.current && !isKeyboardNav) applyTarget(lastTarget.current);
    };

    const onDown = () => {
      isKeyboardNav = false;
      isMouseDown.current = true;
      setPulse(true);
      if (mode.current === "focus" && lastTarget.current)
        applyTarget(lastTarget.current);
    };

    const onUp = () => {
      isMouseDown.current = false;
      setPulse(false);
      if (mode.current === "focus" && lastTarget.current)
        applyTarget(lastTarget.current);
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!isKeyboardNav) return;
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        const el = target.closest(INTERACTIVE_SELECTOR) as HTMLElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          mouseX.current = rect.left + rect.width / 2;
          mouseY.current = rect.top + rect.height / 2;

          if (el !== lastTarget.current) {
            applyTarget(el);
          }
        }
      }
    };

    const onResize = () => {
      if (lastTarget.current && !isKeyboardNav) applyTarget(lastTarget.current);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("resize", onResize);
    };
  }, [isFine, applyTarget]);

  if (!isFine) return null;

  const cornerColor = pulse ? "var(--red-ember)" : "var(--red)";
  const cornerLen = 10;
  const cornerThick = 2;

  const cornerStyle = (pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: cornerLen,
      height: cornerLen,
      transition: "border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    };
    const b = `${cornerThick}px solid ${cornerColor}`;
    if (pos === "tl")
      return { ...base, top: 0, left: 0, borderTop: b, borderLeft: b };
    if (pos === "tr")
      return { ...base, top: 0, right: 0, borderTop: b, borderRight: b };
    if (pos === "bl")
      return { ...base, bottom: 0, left: 0, borderBottom: b, borderLeft: b };
    if (pos === "br")
      return { ...base, bottom: 0, right: 0, borderBottom: b, borderRight: b };
    return base;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99999,
      }}
    >
      {/* IDLE: Dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          transition: "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          width: 8,
          height: 8,
          backgroundColor: "var(--red-ember)",
          boxShadow: "0 0 8px var(--red-ember)",
          borderRadius: "50%",
        }}
      />

      {/* IDLE: Ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          transition: "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          width: 28,
          height: 28,
          border: "2px solid var(--red)",
          borderRadius: "50%",
        }}
      />

      {/* TEXT caret */}
      <div
        ref={textRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          transition: "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            width: 2,
            height: 22,
            background: "var(--amber)",
            animation: "termcursor-blink 0.9s steps(1) infinite",
            boxShadow: `0 0 8px rgba(196,124,46,0.5)`,
          }}
        />
      </div>

      {/* FOCUS Brackets */}
      <div
        ref={focusRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          transition:
            "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
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
                color: "var(--amber)",
                whiteSpace: "nowrap",
              }}
            >
              [{label}]
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes termcursor-blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
