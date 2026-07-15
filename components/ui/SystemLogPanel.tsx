"use client";

import { useState, useEffect, useRef } from "react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";

const LOG_ENTRIES = [
  { tag: "PROCESS", msg: "Compiling first Rust binary..." },
  { tag: "SYNC", msg: "Exploring local LLM inferences via Ollama." },
  { tag: "QUERY", msg: "Vibecoding SQLite architecture for Nomi." },
  { tag: "DAEMON", msg: "Rebuilding Hyprland workspace configurations." },
  { tag: "NETWORK", msg: "Executing PostgreSQL learning marathon." },
  { tag: "DATA_DUMP", msg: "Fragmenting identity into digital components." },
  { tag: "BUILD", msg: "Optimizing Neovim lua runtime." },
  { tag: "LOG", msg: "Assessing Ship of Theseus paradox in system memory." },
  { tag: "OBSERVE", msg: "Scanning lunar far-side for anomalous data." },
  { tag: "RUNTIME", msg: "Translating structured message passing formats." },
];

export default function SystemLogPanel({ delay = 0 }: { delay?: number }) {
  const [current, setCurrent] = useState(0);
  const isVisible = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden || !isVisible.current) return;
      setCurrent((i) => (i + 1) % LOG_ENTRIES.length);
    }, 3000); // rotate every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef}>
      <Panel delay={delay}>
      <PanelHead meta="rotating">
        <Dagger /> <b style={{ color: "var(--text)" }}>SYSTEM_LOG</b> daemon.log
      </PanelHead>
      <PanelBody className="flex flex-col gap-[8px]">
        {[...Array(5)].map((_, i) => {
          const log = LOG_ENTRIES[(current + i) % LOG_ENTRIES.length];
          return (
            <div
              key={`${current}-${i}`} // Force re-render to allow subtle css animations if needed, but array index ensures stability for terminal feel
              className="text-[12px] leading-[1.6]"
              style={{ fontFamily: "var(--mono)" }}
            >
              <span style={{ color: "var(--red)" }}>[{log.tag}]</span>{" "}
              <span style={{ color: "var(--text2)" }}>{log.msg}</span>
            </div>
          );
        })}
      </PanelBody>
    </Panel>
    </div>
  );
}
