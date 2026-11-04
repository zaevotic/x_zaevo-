"use client";

import React from "react";
import { motion } from "framer-motion";

interface WakaBarProps {
  lang: string;
  pct: number;
  text?: string;
  delay?: number;
}

export default function WakaBar({ lang, pct, text, delay = 0 }: WakaBarProps) {
  return (
    <div className="mb-[11px]">
      <div className="flex justify-between text-[11px] mb-[5px]">
        <span style={{ color: "var(--text)" }}>{lang}</span>
        <div className="flex items-center gap-[8px]">
          {text && (
            <span style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}>
              {text}
            </span>
          )}
          <span style={{ color: "var(--text2)" }}>{pct}%</span>
        </div>
      </div>
      <div
        className="h-[5px] border overflow-hidden"
        style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.85,
            delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="h-full"
          style={{
            background:
              "linear-gradient(90deg, var(--red-dim), var(--red-ember))",
          }}
        />
      </div>
    </div>
  );
}
