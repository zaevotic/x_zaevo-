"use client";

import { useState, useEffect, useRef } from "react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";

interface CommitLog {
  id: string;
  repo: string;
  message: string;
  date: Date;
}

// We'll fetch up to 50 recent commits from /api/sys/github
const DEFAULT_LOGS: CommitLog[] = [];


export default function SystemLogPanel({ delay = 0 }: { delay?: number }) {
  const [current, setCurrent] = useState(0);
  const [commits, setCommits] = useState<CommitLog[]>(DEFAULT_LOGS);
  const [loading, setLoading] = useState(true);
  const isVisible = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Fetch recent commits ────────────────────────────────────────
  useEffect(() => {
    fetch("/api/sys/github")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.error && Array.isArray(payload.commits)) {
          // Sort all commits by date descending
          const sorted = payload.commits
            .map((c: any) => ({
              id: c.id,
              repo: c.repo,
              message: c.message,
              date: new Date(c.date),
            }))
            .sort((a: CommitLog, b: CommitLog) => b.date.getTime() - a.date.getTime());

          const repoMap: Record<string, any[]> = {};
          const final: any[] = [];
          for (const commit of sorted) {
            if (Object.keys(repoMap).length >= 10 && !(commit.repo in repoMap)) {
              // already have 10 repos and this one is new – skip
              continue;
            }
            // initialise repo bucket
            if (!repoMap[commit.repo]) repoMap[commit.repo] = [];
            // limit to 5 commits per repo and total 50 commits
            if (repoMap[commit.repo].length < 5 && final.length < 50) {
              repoMap[commit.repo].push(commit);
              final.push(commit);
            }
            if (final.length >= 50) break;
          }
          setCommits(final);
        }
      })
      .catch((e) => console.error("Failed to load commits for SystemLogPanel", e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden || !isVisible.current) return;
      setCurrent((i) => {
        const len = commits.length || 1;
        return (i + 1) % len;
      });
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
          const log = commits[(current + i) % (commits.length || 1)] || { repo: "...", message: "Fetching..." };
          return (
            <div
              key={`${current}-${i}`} // Force re-render to allow subtle css animations if needed, but array index ensures stability for terminal feel
              className="text-[12px] leading-[1.6]"
              style={{ fontFamily: "var(--mono)" }}
            >
              <span style={{ color: "var(--red)" }}>[{log.repo}]</span>{" "}
              <span style={{ color: "var(--text2)" }}>{log.message}</span>
            </div>
          );
        })}
      </PanelBody>
    </Panel>
    </div>
  );
}
