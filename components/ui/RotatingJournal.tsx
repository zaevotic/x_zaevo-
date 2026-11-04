"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";

export interface JournalPost {
  date: string;
  tag?: string;
  tags?: string[];
  title: string;
  excerpt: string;
}

interface Props {
  posts?: JournalPost[];
  loading?: boolean;
  delay?: number;
}

export default function RotatingJournal({
  posts = [],
  loading = false,
  delay = 0.6,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<JournalPost[]>(posts || []);
  const [prevPosts, setPrevPosts] = useState(posts);

  if (posts !== prevPosts) {
    setPrevPosts(posts);
    setItems(posts || []);
  }

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

  const stepForward = () => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      const next = [...prev];
      const first = next.shift()!;
      next.push(first);
      return next;
    });
  };

  const stepBackward = () => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      const next = [...prev];
      const last = next.pop()!;
      next.unshift(last);
      return next;
    });
  };

  useEffect(() => {
    if (items.length <= 4) return;

    const interval = setInterval(() => {
      if (isHovered.current || document.hidden || !isVisible.current) return;
      stepForward();
    }, 4500);

    return () => clearInterval(interval);
  }, [items.length]);

  const displayedItems = items.slice(0, 4);
  const emptyCount = Math.max(0, 4 - items.length);

  return (
    <Panel delay={delay}>
      <PanelHead
        meta={
          <div className="flex items-center gap-[6px]">
            <span>
              {loading
                ? "syncing… · entries.log"
                : `${Math.min(items.length, 4)} / ${items.length} · entries.log`}
            </span>
            {items.length > 4 && (
              <span className="inline-flex items-center gap-[2px] ml-[2px]">
                <button
                  type="button"
                  onClick={stepBackward}
                  aria-label="Previous journal entry"
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
                  aria-label="Next journal entry"
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
        <b style={{ color: "var(--text)", letterSpacing: "1px" }}>JOURNAL</b>
      </PanelHead>
      <PanelBody>
        <div
          ref={containerRef}
          className="flex flex-col w-full overflow-hidden"
          onMouseEnter={() => {
            isHovered.current = true;
          }}
          onMouseLeave={() => {
            isHovered.current = false;
          }}
          onWheel={(e) => {
            if (items.length <= 4 || wheelCooldown.current) return;
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
            }, 320);
          }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="journal-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-[10px]"
              >
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="py-[12px] flex flex-col gap-[8px] opacity-40 animate-pulse border-b border-[var(--border)]"
                  >
                    <div className="flex justify-between items-center">
                      <div
                        className="h-[9px] w-[22%] rounded-[2px]"
                        style={{ background: "var(--border2)" }}
                      />
                      <div
                        className="h-[12px] w-[14%] rounded-[2px]"
                        style={{ background: "var(--border2)" }}
                      />
                    </div>
                    <div
                      className="h-[12px] w-[65%] rounded-[2px]"
                      style={{ background: "var(--border2)" }}
                    />
                    <div
                      className="h-[10px] w-[90%] rounded-[2px]"
                      style={{ background: "var(--border2)" }}
                    />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="journal-loaded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col"
              >
                <div className="flex flex-col">
                  <AnimatePresence mode="popLayout">
                    {displayedItems.map((post, idx) => {
                      const tag = post.tag || post.tags?.[0] || "NOTE";
                      return (
                        <motion.button
                          layout
                          key={post.title}
                          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{
                            opacity: 0,
                            y: -10,
                            filter: "blur(4px)",
                            scale: 0.95,
                          }}
                          transition={{
                            duration: 0.4,
                            delay: idx * 0.05,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/journal?entry=${encodeURIComponent(post.title)}`,
                            );
                          }}
                          className="py-[12px] border-b-[1px] flex flex-col text-left group transition-colors hover:bg-[var(--red-hover-tint)] px-[8px] -mx-[8px] rounded-[4px] shrink-0"
                          style={{
                            borderColor:
                              idx < displayedItems.length - 1
                                ? "var(--border)"
                                : "transparent",
                          }}
                        >
                          <div className="flex justify-between items-center mb-[6px] w-full">
                            <span
                              className="text-[9px]"
                              style={{ color: "var(--text3)" }}
                            >
                              {post.date}
                            </span>
                            <span
                              className="text-[9px] px-[6px] py-[1px] rounded-[2px] tracking-[.06em] border transition-colors group-hover:border-[var(--red-dim)]"
                              style={{
                                color: "var(--amber)",
                                background: "var(--amber-warm-dim)",
                                borderColor: "var(--amber-warm)",
                              }}
                            >
                              {tag}
                            </span>
                          </div>
                          <p
                            className="text-[12px] mb-[4px] transition-colors group-hover:text-[var(--red)]"
                            style={{ color: "var(--text)" }}
                          >
                            {post.title}
                          </p>
                          <p
                            className="text-[10px] font-sans leading-[1.6] line-clamp-1"
                            style={{ color: "var(--text3)" }}
                          >
                            {post.excerpt}
                          </p>
                          <p
                            className="text-[10px] mt-[6px] cursor-pointer transition-colors group-hover:text-[var(--red-ember)]"
                            style={{ color: "var(--red)" }}
                          >
                            read →
                          </p>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {emptyCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full border-dashed border-[1px] rounded-[4px] mt-[8px] flex items-center justify-center"
                    style={{
                      borderColor: "var(--border)",
                      minHeight: `${emptyCount * 105}px`,
                      background: "var(--bg1)",
                    }}
                  >
                    <span
                      className="text-[10px] tracking-[1px] uppercase"
                      style={{
                        color: "var(--text3)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {"// coming soon"}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PanelBody>
    </Panel>
  );
}
