"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface JournalPost {
  date: string;
  tag: string;
  title: string;
  excerpt: string;
}

interface Props {
  posts: JournalPost[];
}

export default function RotatingJournal({ posts }: Props) {
  const [items, setItems] = useState(posts);
  const isHovered = useRef(false);

  // When the component mounts or posts change, reset the array
  useEffect(() => {
    setItems(posts);
  }, [posts]);

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
    if (items.length <= 4) return;

    const interval = setInterval(() => {
      if (isHovered.current || document.hidden || !isVisible.current) return; // Skip updating if hovered or hidden
      setItems((prev) => {
        const next = [...prev];
        const first = next.shift()!;
        next.push(first);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [items.length]);

  const displayedItems = items.slice(0, 4);
  const emptyCount = Math.max(0, 4 - items.length);

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full"
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      onMouseLeave={() => {
        isHovered.current = false;
      }}
    >
      <div className="flex flex-col">
        <AnimatePresence mode="popLayout">
          {displayedItems.map((post, idx) => (
            <motion.button
              layout
              key={post.title} // unique key is essential for AnimatePresence
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof document !== "undefined") {
                  document.dispatchEvent(
                    new CustomEvent("open-journal", { detail: post.title }),
                  );
                }
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
                <span className="text-[9px]" style={{ color: "var(--text3)" }}>
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
                  {post.tag}
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
          ))}
        </AnimatePresence>
      </div>

      {emptyCount > 0 && (
        <div
          className="w-full border-dashed border-[1px] rounded-[4px] mt-[8px] flex items-center justify-center opacity-70"
          style={{
            borderColor: "var(--border)",
            minHeight: `${emptyCount * 105}px`,
            background: "var(--bg1)",
          }}
        >
          <span
            className="text-[10px] tracking-[1px] uppercase"
            style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
          >
            // coming soon
          </span>
        </div>
      )}
    </div>
  );
}
