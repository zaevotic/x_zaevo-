"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const WS_MAP: Record<string, string> = {
  "/home": "1:home",
  "/work": "2:work",
  "/term": "4:term",
  "/signal": "5:signal",
};

function getDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function StatusBar() {
  const [visitCount, setVisitCount] = useState<number>(0);

  useEffect(() => {
    // Trigger a request to the proxy which increments the counter and returns the count in a header
    fetch('/api/sys/proxy')
      .then((res) => {
        const countHeader = res.headers.get('x-visit-count');
        if (countHeader) setVisitCount(parseInt(countHeader, 10));
      })
      .catch(() => setVisitCount(null));
  }, []);

  const pathname = usePathname();
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  useEffect(() => {
    const handleJournalState = (e: Event) => setIsJournalOpen((e as CustomEvent).detail);
    document.addEventListener("journal-state", handleJournalState);
    return () => document.removeEventListener("journal-state", handleJournalState);
  }, []);

  const wsname = isJournalOpen ? "3:journal" : (WS_MAP[pathname] ?? pathname.replace("/", ""));

  return (
    <footer
      className="flex justify-between items-center px-[18px] py-[6px] border-t text-[10px] tracking-[0.5px] sticky bottom-0 z-50"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg2)",
        color: "var(--text3)",
      }}
    >
      <div className="flex gap-[16px]">
        <span>
          WS <b style={{ color: "var(--red-ember)" }}>{wsname}</b>
        </span>
        <span className="hidden sm:inline">niri</span>
      </div>
      <div className="flex items-center gap-[8px]">
        <span className="ml-4">Visits: {visitCount}</span>
        <span className="hidden sm:inline">&nbsp;&middot;&nbsp;</span>
        <span className="hidden sm:inline">zaevo@OMEN-erde</span>
        <span className="hidden sm:inline">&nbsp;&middot;&nbsp;</span>
        <span>{getDate()}</span>
      </div>
            </footer>
  );
}
