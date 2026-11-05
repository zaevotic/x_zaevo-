"use client";
// components/ui/StatusBar.tsx – added commit hash, network info, and session timer
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const WS_MAP: Record<string, string> = {
  "/": "1:home",
  "/home": "1:home",
  "/journal": "2:journal",
  "/term": "3:term",
  "/signal": "4:signal",
  "/admin": "5:admin",
};

function getDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

let cachedVisitCount: number | null = null;
let cachedCommitHash: string | null = null;

export default function StatusBar() {
  const pathname = usePathname();
  const [visitCount, setVisitCount] = useState<number>(() => cachedVisitCount ?? 0);
  const [commitHash, setCommitHash] = useState<string>(() => {
    if (cachedCommitHash) return cachedCommitHash;
    const baked = process.env.NEXT_PUBLIC_COMMIT_HASH;
    return baked && baked !== "-" ? baked.slice(0, 7) : "-";
  });
  const [sessionSec, setSessionSec] = useState<number>(0);

  // Fetch visit count from proxy on mount
  useEffect(() => {
    fetch("/api/sys/proxy")
      .then((res) => {
        const countHeader = res.headers.get("x-visit-count");
        if (countHeader) {
          const parsed = parseInt(countHeader, 10);
          setVisitCount(parsed);
          cachedVisitCount = parsed;
        }
      })
      .catch(() => {});
  }, []);

  // Fetch latest commit hash (lightweight endpoint)
  useEffect(() => {
    fetch("/api/sys/commit")
      .then((r) => r.json())
      .then((data) => {
        if (data?.hash && data.hash !== "-") {
          const h = data.hash.slice(0, 7);
          setCommitHash(h);
          cachedCommitHash = h;
        }
      })
      .catch(() => {});
  }, []);

  // Session timer – counts mm:ss since component mount
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setSessionSec(Math.floor((Date.now() - start) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const wsname = WS_MAP[pathname] ?? pathname.replace("/", "");

  const minutes = Math.floor(sessionSec / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (sessionSec % 60).toString().padStart(2, "0");

  return (
    <footer
      className="flex justify-between items-center px-[18px] py-[6px] border-t text-[10px] tracking-[0.5px] sticky bottom-0 z-50"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg2)",
        color: "var(--text3)",
      }}
    >
      {/* Left side – workspace name */}
      <div className="flex gap-[16px]">
        <span>
          WS <b style={{ color: "var(--red-ember)" }}>{wsname}</b>
        </span>
        <span className="hidden sm:inline">niri</span>
      </div>

      {/* Right side – visits, commit, network, timer, host/date */}
      <div className="flex items-center gap-[8px]">
        <span className="ml-4">Visits: {visitCount}</span>
        {/* separator */}
        <span className="hidden sm:inline">&nbsp;&middot;&nbsp;</span>
        {/* commit hash */}
        <span className="hidden sm:inline">commit:{commitHash}</span>
        <span className="hidden sm:inline">&nbsp;&middot;&nbsp;</span>
        {/* network info */}
        <span className="hidden sm:inline">net: eduroam</span>
        <span className="hidden sm:inline">&nbsp;&middot;&nbsp;</span>
        {/* session timer */}
        <span className="hidden sm:inline">{minutes}:{seconds}</span>
        <span className="hidden sm:inline">&nbsp;&middot;&nbsp;</span>
        {/* host and date */}
        <span className="hidden sm:inline">zaevo@OMEN-erde</span>
        <span className="hidden sm:inline">&nbsp;&middot;&nbsp;</span>
        <span>{getDate()}</span>
      </div>
    </footer>
  );
}
