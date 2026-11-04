"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";

interface CommitLog {
  id: string;
  repo: string;
  message: string;
  date: Date;
}

export default function SystemLogPanel({ delay = 0 }: { delay?: number }) {
  const [items, setItems] = useState<CommitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const isHovered = useRef(false);
  const isVisible = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelCooldown = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch recent commits (up to 25 latest)
  useEffect(() => {
    fetch("/api/sys/github")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.error && Array.isArray(payload.commits)) {
          const sorted = (
            payload.commits as {
              id: string;
              repo: string;
              message: string;
              date: string;
            }[]
          )
            .map((c) => ({
              id: c.id,
              repo: c.repo,
              message: c.message,
              date: new Date(c.date),
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 25);

          setItems(sorted);
        }
      })
      .catch((e) =>
        console.error("Failed to load commits for SystemLogPanel", e),
      )
      .finally(() => setLoading(false));
  }, []);

  const stepForward = () => {
    setItems((prev) => {
      if (prev.length <= 5) return prev;
      const next = [...prev];
      const first = next.shift()!;
      next.push(first);
      return next;
    });
  };

  const stepBackward = () => {
    setItems((prev) => {
      if (prev.length <= 5) return prev;
      const next = [...prev];
      const last = next.pop()!;
      next.unshift(last);
      return next;
    });
  };

  // Rotate between ~25 commits every 2 seconds
  useEffect(() => {
    if (items.length <= 5) return;

    const interval = setInterval(() => {
      if (document.hidden || !isVisible.current || isHovered.current) return;
      stepForward();
    }, 2000);

    return () => clearInterval(interval);
  }, [items.length]);

  const displayedItems = items.slice(0, 5);

  return (
    <div ref={containerRef}>
      <Panel delay={delay}>
        <PanelHead
          meta={
            <div className="flex items-center gap-[6px]">
              <span>rotating · daemon.log</span>
              {items.length > 5 && (
                <span className="inline-flex items-center gap-[2px] ml-[2px]">
                  <button
                    type="button"
                    onClick={stepBackward}
                    aria-label="Previous log"
                    className="p-[2px] rounded-[2px] transition-colors cursor-pointer hover:text-[var(--red)]"
                    style={{
                      color: "var(--text3)",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <ChevronUp size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={stepForward}
                    aria-label="Next log"
                    className="p-[2px] rounded-[2px] transition-colors cursor-pointer hover:text-[var(--red)]"
                    style={{
                      color: "var(--text3)",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <ChevronDown size={11} />
                  </button>
                </span>
              )}
            </div>
          }
        >
          <Dagger /> ~/{" "}
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            SYSTEM_LOG
          </b>
        </PanelHead>
        <PanelBody className="flex flex-col gap-[8px]">
          <div
            className="flex flex-col gap-[8px] overflow-hidden"
            onMouseEnter={() => {
              isHovered.current = true;
            }}
            onMouseLeave={() => {
              isHovered.current = false;
            }}
            onWheel={(e) => {
              if (items.length <= 5 || wheelCooldown.current) return;
              if (Math.abs(e.deltaY) < 10) return;
              e.preventDefault();
              wheelCooldown.current = true;
              if (e.deltaY > 0) {
                stepForward();
              } else {
                stepBackward();
              }
              setTimeout(() => {
                wheelCooldown.current = false;
              }, 250);
            }}
          >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="system-log-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-[8px]"
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="text-[12px] leading-[1.6] opacity-40 animate-pulse truncate"
                    style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}
                  >
                    <span style={{ color: "var(--red)" }}>[...]</span> Fetching
                    daemon log stream…
                  </div>
                ))}
              </motion.div>
            ) : displayedItems.length === 0 ? (
              <motion.div
                key="system-log-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] leading-[1.6]"
                style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}
              >
                <span style={{ color: "var(--red)" }}>[daemon]</span> No commits
                logged
              </motion.div>
            ) : (
              <motion.div
                key="system-log-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-[8px]"
              >
                <AnimatePresence mode="popLayout">
                  {displayedItems.map((log, idx) => (
                    <motion.div
                      layout
                      key={`${log.repo}-${log.id}`}
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{
                        opacity: 0,
                        y: -10,
                        filter: "blur(4px)",
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.35,
                        delay: idx * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="text-[12px] leading-[1.6] truncate"
                      style={{ fontFamily: "var(--mono)" }}
                      title={`[${log.repo}] ${log.message}`}
                    >
                      <span style={{ color: "var(--red)" }}>[{log.repo}]</span>{" "}
                      <span style={{ color: "var(--text2)" }}>{log.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
