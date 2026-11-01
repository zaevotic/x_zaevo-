"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import ReactMarkdown from "react-markdown";

// ----- Types -----
interface JournalEntry {
  id: string;
  title: string;
  tags: string[];
  date: string;
  body: string; // raw markdown content
  callout: string | null;
}


// ── Data ──────────────────────────────────────────────────────────────────────
// Journal entries are loaded dynamically from the API (see useEffect below).

// ── Component ─────────────────────────────────────────────────────────────────

export default function JournalScratchpad() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    // Broadcast state for MonitorBar and StatusBar
    document.dispatchEvent(new CustomEvent("journal-state", { detail: isOpen }));
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ---- Load journal entries from the API on mount ----
  useEffect(() => {
    fetch("/api/usr/journal")
      .then((res) => res.json())
      .then((data: JournalEntry[]) => {
        setEntries(data);
        setSelected(data[0] ?? null);
      })
      .catch((err) => {
        console.error("Failed to load journal entries", err);
      });
  }, []);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Super/Meta + J
      if (e.metaKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Close on Esc
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenJournal = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail === "string") {
        setIsOpen(true);
        const found = entries.find(
          (entry) => entry.title === customEvent.detail,
        );
        if (found) setSelected(found);
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("open-journal", handleOpenJournal);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("open-journal", handleOpenJournal);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed top-[36px] bottom-[27px] left-0 right-0 z-[40] flex items-center justify-center p-[10px] sm:p-[24px]"
          style={{
            background: "rgba(10, 9, 8, 0.85)", // matches --bg (#0a0908) with opacity,
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            className="w-full max-w-[1300px] h-full relative"
          >
            <div className="grid gap-[10px] h-full grid-cols-1 md:grid-cols-[280px_1fr]">
              {/* Mobile overlay */}
              {isMobileMenuOpen && (
                <div 
                  className="absolute inset-0 z-40 bg-[var(--bg)]/60 md:hidden backdrop-blur-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}

              {/* Entry list (Side Menu on mobile) */}
              <div
                className={`
                  absolute md:relative z-50 md:z-auto h-full w-[85%] max-w-[320px] md:w-auto
                  transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0"}
                `}
              >
                <Panel delay={0} className="h-full w-full flex flex-col shadow-2xl md:shadow-none">
                  <PanelHead>
                    <Dagger />{" "}
                    <b style={{ color: "var(--text)" }}>JOURNAL_ENTRIES</b>
                  </PanelHead>
                  <div className="flex-1 overflow-auto">
                  {entries.length === 0 ? (
                    <div
                      className="px-[14px] py-[24px] text-[11px] uppercase tracking-[1px]"
                      style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
                    >
                      {"// 0 entries"}
                    </div>
                  ) : (
                    entries.map((e) => {
                      const active = e.id === selected?.id;
                      return (
                        <button
                          key={e.id}
                          onClick={() => {
                            setSelected(e);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-[14px] py-[12px] border-b cursor-pointer transition-colors"
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
                            className="text-[9px] tracking-[1px] uppercase mb-[5px]"
                            style={{ color: "var(--red-dim)" }}
                          >
                            {e.id}
                          </div>
                          <div
                            className="text-[12px] leading-[1.4] mb-[7px]"
                            style={{ color: "var(--text)" }}
                          >
                            {e.title}
                          </div>
                          <div className="flex gap-[6px]">
                            {(e.tags ?? []).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] px-[6px] py-[2px] border"
                                style={{
                                  color: "var(--text2)",
                                  borderColor: "var(--border)",
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
                </Panel>
              </div>

              {/* Reader */}
              <Panel delay={0.05}>
                <PanelHead
                  meta={
                    <div className="flex items-center gap-[16px]">
                      <span>{selected?.date ?? "—"}</span>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="cursor-pointer transition-colors hover:text-[var(--red)] uppercase tracking-[1px] font-bold"
                        style={{ color: "var(--red-ember)" }}
                      >
                        [x] esc
                      </button>
                    </div>
                  }
                >
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden mr-[10px] uppercase tracking-[1px] font-bold text-[var(--red)] cursor-pointer"
                  >
                    [=] menu
                  </button>
                  <span className="hidden md:inline"><Dagger /></span> <b style={{ color: "var(--text)" }}>~/CONTENTS</b>
                </PanelHead>
                <PanelBody>
                  {selected ? (
                    <>
                      <h1
                        className="text-[30px] leading-none mb-[16px]"
                        style={{
                          fontFamily: "var(--display)",
                          color: "var(--text)",
                          fontWeight: 400,
                        }}
                      >
                        {selected.title}
                      </h1>
                      <div className="text-[12px] leading-[1.85] mb-[12px]">
                        <ReactMarkdown
                          components={{
                            p: ({ ...props }) => (
                              <p {...props} className="mb-2" style={{ color: "var(--text)", opacity: 0.85 }} />
                            ),
                            strong: ({ ...props }) => (
                              <strong {...props} className="font-bold" style={{ color: "var(--text)" }} />
                            ),
                            em: ({ ...props }) => (
                              <em {...props} className="italic" style={{ color: "var(--text)" }} />
                            ),
                            ul: ({ ...props }) => (
                              <ul {...props} className="list-disc pl-4 mb-2" style={{ color: "var(--text)" }} />
                            ),
                            ol: ({ ...props }) => (
                              <ol {...props} className="list-decimal pl-4 mb-2" style={{ color: "var(--text)" }} />
                            ),
                            li: ({ ...props }) => (
                              <li {...props} className="mb-1" style={{ color: "var(--text)" }} />
                            ),
                            h1: ({ ...props }) => (
                              <h1 {...props} className="text-[20px] font-bold mb-2" style={{ color: "var(--text)" }} />
                            ),
                            h2: ({ ...props }) => (
                              <h2 {...props} className="text-[18px] font-bold mb-2" style={{ color: "var(--text)" }} />
                            ),
                            h3: ({ ...props }) => (
                              <h3 {...props} className="text-[16px] font-bold mb-2" style={{ color: "var(--text)" }} />
                            ),
                          }}
                        >
                          {selected.body}
                        </ReactMarkdown>
                      </div>
                      {selected.callout && (
                        <blockquote
                          className="border-l-2 pl-[14px] my-[16px] text-[11px] leading-[1.75]"
                          style={{
                            borderColor: "var(--red)",
                            color: "var(--text2)",
                          }}
                        >
                          {selected.callout}
                        </blockquote>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-[64px] text-center">
                      <span
                        className="text-[11px] tracking-[1.5px] uppercase"
                        style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
                      >
                        {"// no journal entries published yet — coming soon"}
                      </span>
                    </div>
                  )}
                </PanelBody>
              </Panel>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
