"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import ReactMarkdown from "react-markdown";

interface JournalEntry {
  id: string;
  title: string;
  tags: string[];
  date: string;
  body: string;
  callout: string | null;
}

function JournalWorkspaceContent() {
  const searchParams = useSearchParams();
  const requestedTitle = searchParams.get("entry");

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/usr/journal")
      .then((res) => res.json())
      .then((data: JournalEntry[]) => {
        if (!Array.isArray(data)) return;
        setEntries(data);
        if (requestedTitle) {
          const match = data.find((e) => e.title === requestedTitle);
          setSelected(match ?? data[0] ?? null);
        } else {
          setSelected(data[0] ?? null);
        }
      })
      .catch((err) => {
        console.error("Failed to load journal entries", err);
      });
  }, [requestedTitle]);

  return (
    <div className="grid gap-[10px] h-full grid-cols-1 md:grid-cols-[280px_1fr] relative">
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
        <Panel
          delay={0.1}
          className="h-full w-full flex flex-col shadow-2xl md:shadow-none"
        >
          <PanelHead meta={`${entries.length} total`}>
            <Dagger /> <b style={{ color: "var(--text)" }}>JOURNAL_ENTRIES</b>
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
                    type="button"
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
      <Panel delay={0.15} className="h-full flex flex-col">
        <PanelHead meta={<span>{selected?.date ?? "—"}</span>}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden mr-[10px] uppercase tracking-[1px] font-bold text-[var(--red)] cursor-pointer"
          >
            [=] menu
          </button>
          <span className="hidden md:inline">
            <Dagger />
          </span>{" "}
          <b style={{ color: "var(--text)" }}>~/CONTENTS</b>
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
                      <p
                        {...props}
                        className="mb-2"
                        style={{ color: "var(--text)", opacity: 0.85 }}
                      />
                    ),
                    strong: ({ ...props }) => (
                      <strong
                        {...props}
                        className="font-bold"
                        style={{ color: "var(--text)" }}
                      />
                    ),
                    em: ({ ...props }) => (
                      <em
                        {...props}
                        className="italic"
                        style={{ color: "var(--text)" }}
                      />
                    ),
                    ul: ({ ...props }) => (
                      <ul
                        {...props}
                        className="list-disc pl-4 mb-2"
                        style={{ color: "var(--text)" }}
                      />
                    ),
                    ol: ({ ...props }) => (
                      <ol
                        {...props}
                        className="list-decimal pl-4 mb-2"
                        style={{ color: "var(--text)" }}
                      />
                    ),
                    li: ({ ...props }) => (
                      <li
                        {...props}
                        className="mb-1"
                        style={{ color: "var(--text)" }}
                      />
                    ),
                    h1: ({ ...props }) => (
                      <h1
                        {...props}
                        className="text-[20px] font-bold mb-2"
                        style={{ color: "var(--text)" }}
                      />
                    ),
                    h2: ({ ...props }) => (
                      <h2
                        {...props}
                        className="text-[18px] font-bold mb-2"
                        style={{ color: "var(--text)" }}
                      />
                    ),
                    h3: ({ ...props }) => (
                      <h3
                        {...props}
                        className="text-[16px] font-bold mb-2"
                        style={{ color: "var(--text)" }}
                      />
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
  );
}

export default function JournalPage() {
  return (
    <Suspense fallback={null}>
      <JournalWorkspaceContent />
    </Suspense>
  );
}

