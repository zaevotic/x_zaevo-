"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import ReactMarkdown from "react-markdown";
import { X, Copy, Terminal } from "lucide-react";
import type { JournalPost } from "@/lib/journal";
import JournalEchoes from "@/components/sys/usr/journal-echoes";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): HeadingItem[] {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const headings: HeadingItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2]
        .trim()
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1");
      const id =
        "h-" +
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      headings.push({ id, text, level });
    }
  }
  return headings;
}

interface Props {
  initialPosts: JournalPost[];
}

export default function JournalWorkspace({ initialPosts }: Props) {
  const searchParams = useSearchParams();
  const requestedTitle = searchParams.get("entry");

  const [entries, setEntries] = useState<JournalPost[]>(initialPosts || []);
  const [prevInitial, setPrevInitial] = useState<JournalPost[]>(initialPosts || []);
  if (initialPosts !== prevInitial) {
    setPrevInitial(initialPosts);
    setEntries(initialPosts);
  }

  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

  const matchedId = useMemo(() => {
    if (!requestedTitle || entries.length === 0) return null;
    const match = entries.find(
      (e) => e.title === requestedTitle || e.id === requestedTitle,
    );
    return match?.id ?? null;
  }, [requestedTitle, entries]);

  const selectedId = userSelectedId ?? matchedId ?? entries[0]?.id ?? null;
  const setSelectedId = (id: string | null) => setUserSelectedId(id);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const readerScrollRef = useRef<HTMLDivElement>(null);

  // Filter entries by search query and tag
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entries.filter((entry) => {
      if (selectedTag && !entry.tags?.includes(selectedTag)) {
        return false;
      }
      if (!q) return true;
      const haystack = (
        entry.title +
        " " +
        (entry.tags ?? []).join(" ") +
        " " +
        entry.body
      ).toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, searchQuery, selectedTag]);

  // Derived selected entry
  const selected = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    if (selectedId) {
      const match = filteredEntries.find((e) => e.id === selectedId);
      if (match) return match;
    }
    return filteredEntries[0] ?? null;
  }, [filteredEntries, selectedId]);

  // Unique tags with counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) {
      for (const t of e.tags ?? []) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  // 12-month archive cells
  const archiveMonths = useMemo(() => {
    const now = new Date();
    const cells: { monthKey: string; label: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleString("en", { month: "short" });
      const count = entries.filter((e) => e.date?.startsWith(key)).length;
      cells.push({ monthKey: key, label, count });
    }
    return cells;
  }, [entries]);

  // Headings of current selected post
  const headings = useMemo(() => {
    return selected ? extractHeadings(selected.body) : [];
  }, [selected]);

  // Track reading progress on scroll
  const handleScroll = () => {
    if (!readerScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = readerScrollRef.current;
    const max = scrollHeight - clientHeight;
    setReadingProgress(max > 0 ? (scrollTop / max) * 100 : 0);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setSearchQuery("");
        setSelectedTag(null);
        return;
      }

      if (isInput) return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentIdx = filteredEntries.findIndex(
          (item) => item.id === selected?.id,
        );
        if (currentIdx < filteredEntries.length - 1) {
          setSelectedId(filteredEntries[currentIdx + 1].id);
        }
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIdx = filteredEntries.findIndex(
          (item) => item.id === selected?.id,
        );
        if (currentIdx > 0) {
          setSelectedId(filteredEntries[currentIdx - 1].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredEntries, selected]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const copyCurl = () => {
    if (!selected) return;
    const curlCmd = `curl -s https://zaevo.dev/api/usr/journal`;
    navigator.clipboard.writeText(curlCmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="grid gap-[10px] h-full grid-cols-1 md:grid-cols-[280px_1fr] xl:grid-cols-[310px_1fr_270px] relative">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="absolute inset-0 z-40 bg-[var(--bg)]/60 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── COLUMN 1: ENTRY LIST & FILTER ─────────────────────────── */}
      <div
        className={`
          absolute md:relative z-50 md:z-auto h-full w-[88%] max-w-[320px] md:w-auto
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0"}
        `}
      >
        <Panel
          delay={0.1}
          className="h-full w-full flex flex-col shadow-2xl md:shadow-none"
        >
          <PanelHead
            meta={
              <span className="tabular-nums">
                {filteredEntries.length}/{entries.length}
                <span className="hidden sm:inline"> entries</span>
                <span className="hidden 2xl:inline"> · entries.lst</span>
              </span>
            }
          >
            <Dagger /> ~/{" "}
            <b
              className="truncate"
              style={{ color: "var(--text)", letterSpacing: "1px" }}
            >
              <span className="hidden sm:inline">JOURNAL_</span>ENTRIES
            </b>
          </PanelHead>

          {/* Tools: $ grep search input */}
          <div
            className="px-[12px] py-[8px] border-b shrink-0 flex items-center gap-[8px]"
            style={{ borderColor: "var(--border)", background: "var(--bg1)" }}
          >
            <span
              className="text-[11px] font-bold select-none"
              style={{ color: "var(--red)", fontFamily: "var(--mono)" }}
            >
              $ grep
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="filter entries… (/)"
              className="flex-1 bg-transparent border-0 outline-none text-[11px] placeholder:opacity-40"
              style={{
                color: "var(--text)",
                fontFamily: "var(--mono)",
              }}
            />
            {(searchQuery || selectedTag) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag(null);
                }}
                className="cursor-pointer hover:text-[var(--red)] transition-colors p-[2px]"
                style={{ color: "var(--text3)" }}
                aria-label="Clear filters"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Active Tag Filter Indicator */}
          {selectedTag && (
            <div
              className="px-[12px] py-[4px] border-b flex items-center justify-between text-[10px]"
              style={{
                borderColor: "var(--border)",
                background: "var(--red-mute)",
                color: "var(--text2)",
                fontFamily: "var(--mono)",
              }}
            >
              <span>
                tag:{" "}
                <b style={{ color: "var(--red-ember)" }}>{selectedTag}</b>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="cursor-pointer text-[var(--red)] hover:underline"
              >
                [clear]
              </button>
            </div>
          )}

          {/* Entries Scrollable List */}
          <div className="flex-1 overflow-auto">
            {entries.length === 0 ? (
              <div
                className="px-[14px] py-[28px] text-[11px] uppercase tracking-[1px]"
                style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
              >
                {"// 0 entries"}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div
                className="px-[14px] py-[28px] text-[11px]"
                style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
              >
                no matches
                <span className="inline-block w-[6px] h-[12px] bg-[var(--red)] ml-[4px] animate-pulse align-middle" />
              </div>
            ) : (
              filteredEntries.map((e) => {
                const active = e.id === selected?.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(e.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-[14px] py-[12px] border-b cursor-pointer transition-colors block"
                    style={{
                      borderColor: "var(--border)",
                      borderLeft: active
                        ? "2px solid var(--red)"
                        : "2px solid transparent",
                      background: active
                        ? "rgba(182,24,43,0.08)"
                        : "transparent",
                    }}
                  >
                    <div
                      className="text-[9px] tracking-[1px] uppercase mb-[4px]"
                      style={{
                        color: active ? "var(--red)" : "var(--red-dim)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {e.date}
                    </div>
                    <div
                      className="text-[12px] leading-[1.4] mb-[6px] font-medium"
                      style={{ color: active ? "var(--text)" : "var(--text2)" }}
                    >
                      {e.title}
                    </div>
                    <div className="flex flex-wrap gap-[6px]">
                      {(e.tags ?? []).map((tag) => (
                        <span
                          key={tag}
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setSelectedTag(selectedTag === tag ? null : tag);
                          }}
                          className="text-[9px] px-[6px] py-[1px] border tracking-[0.5px] uppercase transition-colors"
                          style={{
                            color:
                              selectedTag === tag
                                ? "var(--red-ember)"
                                : "var(--text3)",
                            borderColor:
                              selectedTag === tag
                                ? "var(--red)"
                                : "var(--border2)",
                            background:
                              selectedTag === tag
                                ? "var(--red-mute)"
                                : "var(--bg1)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Keyboard Hint */}
          <div
            className="px-[12px] py-[6px] border-t shrink-0 text-[10px] select-none flex items-center justify-between"
            style={{
              borderColor: "var(--border)",
              color: "var(--text3)",
              fontFamily: "var(--mono)",
            }}
          >
            <span>j/k move · / search</span>
            <span>esc clear</span>
          </div>
        </Panel>
      </div>

      {/* ── COLUMN 2: READER & READING PROGRESS ───────────────────── */}
      <Panel delay={0.15} className="h-full flex flex-col min-w-0">
        <PanelHead
          meta={
            <div className="flex items-center gap-[8px]">
              {selected && (
                <button
                  type="button"
                  onClick={copyCurl}
                  title="Copy curl command to terminal"
                  className="hidden sm:inline-flex items-center gap-[4px] px-[6px] py-[1px] border text-[9px] tracking-[0.5px] uppercase transition-colors cursor-pointer hover:border-[var(--red)]"
                  style={{
                    borderColor: "var(--border2)",
                    background: "var(--bg1)",
                    color: copiedCurl ? "var(--amber)" : "var(--text3)",
                  }}
                >
                  <Terminal size={10} />
                  <span>{copiedCurl ? "COPIED" : "CURL"}</span>
                </button>
              )}
              <span className="truncate max-w-[130px] sm:max-w-[200px] md:max-w-[280px] xl:max-w-none">
                {selected
                  ? `${selected.date} · ${selected.id}.md`
                  : "— · entry.md"}
              </span>
            </div>
          }
        >
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden mr-[10px] uppercase tracking-[1px] font-bold text-[var(--red)] cursor-pointer"
          >
            [=] menu
          </button>
          <span className="hidden md:inline">
            <Dagger /> ~/{" "}
          </span>
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            CONTENTS
          </b>
        </PanelHead>

        {/* 2px Reading Progress Bar */}
        <div
          className="h-[2px] shrink-0"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full transition-all duration-75"
            style={{
              width: `${readingProgress}%`,
              background: "var(--red)",
              boxShadow: "0 0 8px var(--red-ember)",
            }}
          />
        </div>

        {/* Scrollable Reader Body */}
        <div
          ref={readerScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto p-[20px] sm:p-[32px] md:p-[40px]"
        >
          {selected ? (
            <div className="max-w-[76ch] mx-auto">
              {/* Heading 1 in Pirata One Display font */}
              <h1
                className="text-[36px] sm:text-[44px] leading-[1.1] mb-[12px]"
                style={{
                  fontFamily: "var(--display)",
                  color: "var(--text)",
                  textShadow: "0 0 24px rgba(225, 29, 46, 0.25)",
                }}
              >
                {selected.title}
              </h1>

              {/* Meta bar: date · min read · words · tags */}
              <div
                className="flex items-center gap-[10px] flex-wrap text-[11px] pb-[20px] mb-[24px] border-b"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text3)",
                  fontFamily: "var(--mono)",
                }}
              >
                <span>{selected.date}</span>
                <span>·</span>
                <span>{selected.readTime} min read</span>
                <span>·</span>
                <span>{selected.words} words</span>
                {selected.tags && selected.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <div className="flex flex-wrap gap-[6px]">
                      {selected.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setSelectedTag(selectedTag === tag ? null : tag)
                          }
                          className="text-[9px] px-[6px] py-[1px] border tracking-[0.5px] uppercase transition-colors cursor-pointer"
                          style={{
                            color:
                              selectedTag === tag
                                ? "var(--red-ember)"
                                : "var(--text2)",
                            borderColor:
                              selectedTag === tag
                                ? "var(--red)"
                                : "var(--border2)",
                            background:
                              selectedTag === tag
                                ? "var(--red-mute)"
                                : "var(--bg1)",
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Markdown Content */}
              <div className="leading-[1.8]">
                <ReactMarkdown
                  components={{
                    h1: ({ ...props }) => (
                      <h1
                        className="text-[22px] font-bold text-[var(--text)] mt-[28px] mb-[12px]"
                        {...props}
                      />
                    ),
                    h2: ({ children, ...props }) => {
                      const text = String(children).replace(
                        /\*\*(.*?)\*\*/g,
                        "$1",
                      );
                      const id =
                        "h-" +
                        text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "");
                      return (
                        <h2
                          id={id}
                          className="text-[17px] font-bold text-[var(--text)] mt-[28px] mb-[12px] scroll-mt-[20px]"
                          {...props}
                        >
                          <span style={{ color: "var(--red)" }}>{"## "}</span>
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children, ...props }) => {
                      const text = String(children).replace(
                        /\*\*(.*?)\*\*/g,
                        "$1",
                      );
                      const id =
                        "h-" +
                        text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "");
                      return (
                        <h3
                          id={id}
                          className="text-[14px] font-bold text-[var(--text2)] mt-[20px] mb-[8px] scroll-mt-[20px]"
                          {...props}
                        >
                          <span style={{ color: "var(--red-dim)" }}>
                            {"### "}
                          </span>
                          {children}
                        </h3>
                      );
                    },
                    p: ({ ...props }) => (
                      <p
                        className="text-[13px] leading-[1.8] text-[var(--text)] mb-[14px]"
                        {...props}
                      />
                    ),
                    strong: ({ ...props }) => (
                      <strong
                        className="font-bold text-[var(--text)]"
                        {...props}
                      />
                    ),
                    em: ({ ...props }) => (
                      <em className="italic text-[var(--text)]" {...props} />
                    ),
                    code: ({ className, children, ...props }) => {
                      const isMultiLine =
                        String(children).includes("\n") ||
                        (className && className.includes("language-"));

                      if (!isMultiLine) {
                        return (
                          <code
                            className="text-[11px] px-[5px] py-[1px] rounded-[2px] border"
                            style={{
                              color: "var(--amber)",
                              background: "var(--bg1)",
                              borderColor: "var(--border)",
                              fontFamily: "var(--mono)",
                            }}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      const lang = (className || "").replace("language-", "").toUpperCase() || "CODE";
                      const textToCopy = String(children).replace(/\n$/, "");

                      return (
                        <div
                          className="relative my-[16px] border border-l-2"
                          style={{
                            borderColor: "var(--border)",
                            borderLeftColor: "var(--red)",
                            background: "var(--bg)",
                          }}
                        >
                          <div
                            className="flex items-center justify-between px-[12px] py-[6px] border-b text-[10px]"
                            style={{
                              borderColor: "var(--border2)",
                              background: "var(--bg1)",
                              fontFamily: "var(--mono)",
                            }}
                          >
                            <span style={{ color: "var(--red-ember)", fontWeight: "bold" }}>
                              [{lang}]
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(textToCopy);
                              }}
                              className="text-[9px] uppercase tracking-[1px] hover:text-[var(--red)] transition-colors cursor-pointer flex items-center gap-[4px]"
                              style={{ color: "var(--text3)" }}
                            >
                              <Copy size={10} />
                              <span>COPY</span>
                            </button>
                          </div>
                          <pre
                            className="p-[14px] overflow-auto text-[12px] leading-[1.6]"
                            style={{
                              fontFamily: "var(--mono)",
                              color: "var(--text)",
                            }}
                          >
                            <code>{children}</code>
                          </pre>
                        </div>
                      );
                    },
                    pre: ({ children }) => <>{children}</>,
                    blockquote: ({ children, ...props }) => (
                      <blockquote
                        className="border-l-2 pl-[14px] my-[16px] text-[12px] italic leading-[1.7]"
                        style={{
                          borderLeftColor: "var(--red)",
                          color: "var(--text2)",
                          background: "rgba(182,24,43,0.03)",
                          paddingTop: "6px",
                          paddingBottom: "6px",
                        }}
                        {...props}
                      >
                        {children}
                      </blockquote>
                    ),
                    ul: ({ ...props }) => (
                      <ul
                        className="mb-[14px] pl-[6px] flex flex-col gap-[4px]"
                        {...props}
                      />
                    ),
                    ol: ({ ...props }) => (
                      <ol
                        className="mb-[14px] pl-[18px] list-decimal flex flex-col gap-[4px] text-[13px] text-[var(--text)]"
                        {...props}
                      />
                    ),
                    li: ({ children, ...props }) => (
                      <li
                        className="relative pl-[18px] text-[13px] text-[var(--text)]"
                        {...props}
                      >
                        <span
                          className="absolute left-0 select-none"
                          style={{ color: "var(--red)" }}
                        >
                          &gt;
                        </span>
                        {children}
                      </li>
                    ),
                    a: ({ ...props }) => (
                      <a
                        className="underline underline-offset-[3px] transition-colors"
                        style={{ color: "var(--red)" }}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                  }}
                >
                  {selected.body}
                </ReactMarkdown>
              </div>

              {selected.callout && (
                <div
                  className="border-l-2 p-[14px] my-[24px] text-[11px] leading-[1.75]"
                  style={{
                    borderColor: "var(--red)",
                    background: "var(--red-mute)",
                    color: "var(--text2)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  <span
                    className="block text-[9px] tracking-[1px] uppercase font-bold mb-[4px]"
                    style={{ color: "var(--red-ember)" }}
                  >
                    {"// DIAGNOSTIC_CALLOUT"}
                  </span>
                  {selected.callout}
                </div>
              )}

              {/* ── CLERK-POWERED SIGNED ECHOES (TERMINAL COMMENTS & REACTIONS) ── */}
              <JournalEchoes postSlug={selected.id} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-[64px] text-center">
              <span
                className="text-[11px] tracking-[1.5px] uppercase"
                style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
              >
                {"// no journal entries found"}
                <span className="inline-block w-[6px] h-[14px] bg-[var(--red)] ml-[6px] animate-pulse align-middle" />
              </span>
            </div>
          )}
        </div>
      </Panel>

      {/* ── COLUMN 3: INSPECTOR (TAGS, ARCHIVE, OUTLINE) ─────────── */}
      <div className="hidden xl:flex flex-col gap-[10px] min-h-0 h-full">
        {/* TAGS PANEL */}
        <Panel delay={0.2} style={{ flex: "none" }}>
          <PanelHead meta="tags.cfg">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>TAGS</b>
          </PanelHead>
          <PanelBody className="p-[12px]">
            {tagCounts.length === 0 ? (
              <span
                className="text-[11px]"
                style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
              >
                {"// none"}
              </span>
            ) : (
              <div className="flex flex-wrap gap-[6px]">
                {tagCounts.map(([tag, count]) => {
                  const active = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTag(active ? null : tag)
                      }
                      className="text-[10px] px-[8px] py-[3px] border tracking-[0.5px] uppercase transition-colors cursor-pointer flex items-center gap-[4px]"
                      style={{
                        borderColor: active ? "var(--red)" : "var(--border2)",
                        background: active ? "var(--red-mute)" : "var(--bg1)",
                        color: active ? "var(--red-ember)" : "var(--text2)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      <span>{tag}</span>
                      <span
                        style={{
                          color: active ? "var(--red)" : "var(--text3)",
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </PanelBody>
        </Panel>

        {/* ARCHIVE PANEL */}
        <Panel delay={0.25} style={{ flex: "none" }}>
          <PanelHead meta="last 12 mo">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              ARCHIVE
            </b>
          </PanelHead>
          <PanelBody className="p-[12px]">
            <div className="grid grid-cols-6 gap-[4px]">
              {archiveMonths.map((cell) => (
                <div
                  key={cell.monthKey}
                  title={`${cell.monthKey}: ${cell.count} ${
                    cell.count === 1 ? "entry" : "entries"
                  }`}
                  className="aspect-[1.3] border relative p-[4px] flex flex-col justify-between transition-colors select-none"
                  style={{
                    borderColor: "var(--border2)",
                    background:
                      cell.count === 0
                        ? "var(--bg1)"
                        : cell.count === 1
                        ? "rgba(182, 24, 43, 0.25)"
                        : cell.count === 2
                        ? "rgba(182, 24, 43, 0.55)"
                        : "var(--red)",
                  }}
                >
                  <span
                    className="text-[8px] uppercase tracking-[0.5px]"
                    style={{
                      color: "var(--text3)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {cell.label}
                  </span>
                  {cell.count > 0 && (
                    <span
                      className="text-[9px] font-bold text-right"
                      style={{
                        color: "var(--text)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {cell.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </PanelBody>
        </Panel>

        {/* OUTLINE / TOC PANEL */}
        <Panel delay={0.3} className="flex-1 flex flex-col min-h-0">
          <PanelHead meta="toc.md">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              OUTLINE
            </b>
          </PanelHead>
          <PanelBody className="overflow-auto p-[12px]">
            {headings.length === 0 ? (
              <span
                className="text-[11px]"
                style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
              >
                {"// no headings"}
              </span>
            ) : (
              <div className="flex flex-col gap-[2px]">
                {headings.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => scrollToHeading(h.id)}
                    className="text-left py-[4px] border-l transition-colors cursor-pointer text-[11px] truncate group hover:text-[var(--red)]"
                    style={{
                      borderColor: "var(--border2)",
                      color: "var(--text3)",
                      fontFamily: "var(--mono)",
                      paddingLeft: h.level === 3 ? "18px" : "8px",
                    }}
                  >
                    <span className="group-hover:translate-x-[2px] transition-transform inline-block">
                      {h.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
