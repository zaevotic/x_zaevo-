"use client";

import { useEffect, useRef, useState } from "react";
import {
  Cpu,
  FileCode,
  Terminal,
  Star,
  Code2,
  Boxes,
  ChevronUp,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import { getSharedGithubData, getCachedGithubData } from "@/lib/github-client";

interface RepoProject {
  name: string;
  desc: string;
  url: string;
  stars: number;
  primaryLanguage: string | null;
  stack: string[];
}

function getProjectIcon(lang: string | null, idx: number): LucideIcon {
  const l = (lang || "").toLowerCase();
  if (l === "rust" || l === "c" || l === "c++" || l === "zig") return Cpu;
  if (l === "shell" || l === "lua" || l === "nix") return Terminal;
  if (l === "typescript" || l === "javascript") return Code2;
  if (l === "python" || l === "go") return FileCode;
  const fallbacks: LucideIcon[] = [Cpu, FileCode, Terminal, Code2, Boxes];
  return fallbacks[idx % fallbacks.length];
}

export default function FeaturedProjectsPanel({
  delay = 0,
}: {
  delay?: number;
}) {
  const cached = getCachedGithubData();
  const cachedRepos = Array.isArray(cached?.repos) && cached.repos.length > 0 ? (cached.repos as RepoProject[]) : null;

  const [items, setItems] = useState<RepoProject[]>(() => cachedRepos ?? []);
  const [loading, setLoading] = useState(!cachedRepos);
  const isHovered = useRef(false);
  const isVisible = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelCooldown = useRef(false);

  useEffect(() => {
    getSharedGithubData()
      .then((data) => {
        if (Array.isArray(data.repos) && data.repos.length > 0) {
          setItems(data.repos);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    if (items.length <= 3) return;

    const interval = setInterval(() => {
      if (isHovered.current || document.hidden || !isVisible.current) return;
      stepForward();
    }, 4200);

    return () => clearInterval(interval);
  }, [items.length]);

  const displayedItems = items.slice(0, 3);

  return (
    <Panel delay={delay}>
      <PanelHead
        meta={
          <div className="flex items-center gap-[6px]">
            <span>
              {`${Math.min(items.length, 3)} / ${items.length} · projects.lst`}
            </span>
            {items.length > 3 && (
              <span className="inline-flex items-center gap-[2px] ml-[2px]">
                <button
                  type="button"
                  onClick={stepBackward}
                  aria-label="Previous project"
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
                  aria-label="Next project"
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
          FEATURED_PROJECTS
        </b>
      </PanelHead>
      <PanelBody>
        <div
          ref={containerRef}
          className="flex flex-col gap-[10px] overflow-hidden"
          onMouseEnter={() => {
            isHovered.current = true;
          }}
          onMouseLeave={() => {
            isHovered.current = false;
          }}
          onWheel={(e) => {
            if (items.length <= 3 || wheelCooldown.current) return;
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
                key="loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-[10px]"
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-[16px] p-[14px] border border-[var(--border)] bg-[var(--bg)] opacity-40 animate-pulse"
                  >
                    <div
                      className="w-[44px] h-[44px] border shrink-0"
                      style={{
                        borderColor: "var(--border2)",
                        background: "var(--bg1)",
                      }}
                    />
                    <div className="flex flex-col flex-1 min-w-0 justify-center gap-[8px]">
                      <div
                        className="h-[14px] w-[35%] rounded-[2px]"
                        style={{ background: "var(--border2)" }}
                      />
                      <div
                        className="h-[12px] w-[80%] rounded-[2px]"
                        style={{ background: "var(--border2)" }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : displayedItems.length === 0 ? (
              <motion.p
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px]"
                style={{ color: "var(--text3)" }}
              >
                No public repositories found.
              </motion.p>
            ) : (
              <motion.div
                key="loaded-projects"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-[10px]"
              >
                <AnimatePresence mode="popLayout">
                  {displayedItems.map((proj, idx) => {
                    const Icon = getProjectIcon(proj.primaryLanguage, idx);
                    return (
                      <motion.a
                        layout
                        key={proj.name}
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{
                          opacity: 0,
                          y: -14,
                          filter: "blur(6px)",
                          scale: 0.97,
                        }}
                        transition={{
                          duration: 0.45,
                          delay: idx * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="group flex gap-[16px] p-[14px] border transition-colors cursor-pointer no-underline bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--bg2)] hover:border-[var(--red-dim)] shrink-0"
                      >
                    {/* Icon */}
                    <div
                      className="flex items-center justify-center w-[44px] h-[44px] border shrink-0 transition-colors group-hover:border-[var(--red-dim)] group-hover:text-[var(--red-ember)]"
                      style={{
                        borderColor: "var(--border2)",
                        background: "var(--bg1)",
                        color: "var(--text2)",
                      }}
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-[8px] mb-[6px]">
                        <h3
                          className="text-[13px] font-bold tracking-[0.5px] truncate transition-colors group-hover:text-[var(--text)]"
                          style={{
                            color: "var(--text2)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          {proj.name}
                        </h3>
                        <div
                          className="text-[10px] flex items-center gap-[4px] uppercase tracking-[1px] shrink-0 transition-colors group-hover:text-[var(--amber)]"
                          style={{
                            color: "var(--text3)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          <Star size={10} strokeWidth={2.5} />
                          {proj.stars}
                        </div>
                      </div>
                      <p
                        className="text-[12px] font-sans leading-[1.55] mb-[10px] line-clamp-2"
                        style={{ color: "var(--text2)" }}
                      >
                        {proj.desc}
                      </p>
                      <div className="flex flex-wrap gap-[8px]">
                        {proj.stack.map((s) => (
                          <span
                            key={s}
                            className="text-[9px] px-[8px] py-[2px] border tracking-[0.5px] uppercase transition-colors group-hover:border-[var(--red-dim)] group-hover:text-[var(--red)]"
                            style={{
                              borderColor: "var(--border2)",
                              color: "var(--text3)",
                              fontFamily: "var(--mono)",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.a>
                );
              })}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PanelBody>
    </Panel>
  );
}
