"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { generateMarqueeSequence, MarqueeSequenceItem } from "@/lib/marquee";

export default function HeroMarquee() {
  const [mounted, setMounted] = useState(false);
  const [strip1, setStrip1] = useState<MarqueeSequenceItem[]>([]);
  const [strip2, setStrip2] = useState<MarqueeSequenceItem[]>([]);

  useEffect(() => {
    setStrip1(generateMarqueeSequence(10));
    setStrip2(generateMarqueeSequence(10));
    setMounted(true);
  }, []);

  const content1 = useMemo(() => [...strip1, ...strip1].map((item, i) => (
    <span
      key={`1-${i}`}
      className="whitespace-nowrap px-[24px]"
      style={{ color: item.color }}
    >
      {item.text}
    </span>
  )), [strip1]);

  const content2 = useMemo(() => [...strip2, ...strip2].map((item, i) => (
    <span
      key={`2-${i}`}
      className="whitespace-nowrap px-[24px]"
      style={{ color: item.color }}
    >
      {item.text}
    </span>
  )), [strip2]);

  if (!mounted) {
    return (
      <div
        className="mt-[12px] pt-[8px] pb-[8px] border-t min-h-[60px]"
        style={{ borderColor: "var(--border2)" }}
      />
    );
  }

  return (
    <div
      className="flex flex-col gap-[6px] overflow-hidden w-full relative mt-[12px] pt-[8px] pb-[8px] border-t"
      style={{ borderColor: "var(--border2)" }}
    >
      {/* Edge gradients for smooth fade matching var(--bg1) which is the panel background */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[60px] z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, var(--bg1), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-[60px] z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, var(--bg1), transparent)",
        }}
      />

      {/* Strip 1 */}
      <div
        className="flex w-max"
        style={{ fontFamily: "var(--mono)", fontSize: "11px" }}
      >
        <motion.div
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
        >
          {content1}
        </motion.div>
      </div>

      {/* Strip 2 */}
      <div
        className="flex w-max"
        style={{ fontFamily: "var(--mono)", fontSize: "11px" }}
      >
        <motion.div
          className="flex w-max"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ ease: "linear", duration: 50, repeat: Infinity }}
        >
          {content2}
        </motion.div>
      </div>
    </div>
  );
}
