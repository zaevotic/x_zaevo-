"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useSyncExternalStore,
} from "react";
import Panel, { PanelHead, Dagger } from "@/components/ui/Panel";
import { ChevronRight, ChevronDown } from "lucide-react";

export type MailLogLevel = "OK" | "INF" | "SYS" | "WRN" | "ERR";

export interface MailLogEntry {
  id: string;
  time: string;
  status: MailLogLevel;
  msg: string;
  details?: Record<string, string>;
}

export interface MailLogHandle {
  log: (
    status: MailLogLevel,
    msg: string,
    details?: Record<string, string>
  ) => void;
}

const LEVEL_COLORS: Record<MailLogLevel, string> = {
  OK: "var(--green)",
  INF: "var(--amber)",
  SYS: "var(--text3)",
  WRN: "var(--amber)",
  ERR: "var(--red-ember)",
};

const IDLE_HEARTBEATS = [
  { status: "SYS" as const, msg: "qmgr: scheduled queue scan [0 deferred]" },
  { status: "INF" as const, msg: "postfix/anvil: connection rate metrics nominal" },
  { status: "SYS" as const, msg: "smtpd: keepalive ping acknowledged [127.0.0.1]" },
  { status: "OK" as const, msg: "dkim-filter: key cache validated [rsa-2048]" },
  { status: "SYS" as const, msg: "smtpd: TLS session cache pruned [0 expired]" },
];

function formatTime(d: Date = new Date()): string {
  return [
    String(d.getHours()).padStart(2, "0"),
    String(d.getMinutes()).padStart(2, "0"),
    String(d.getSeconds()).padStart(2, "0"),
  ].join(":");
}

const emptySubscribe = () => () => {};

const STATIC_INIT: MailLogEntry[] = [
  {
    id: "init-1",
    time: "23:01:10",
    status: "SYS",
    msg: "smtpd: daemon listening on 127.0.0.1:587",
    details: {
      proto: "ESMTP",
      bind: "127.0.0.1:587",
      cipher: "TLS_AES_256_GCM_SHA384",
    },
  },
  {
    id: "init-2",
    time: "23:01:12",
    status: "OK",
    msg: "tls: cipher TLS_AES_256_GCM_SHA384 established",
  },
  {
    id: "init-3",
    time: "23:01:14",
    status: "SYS",
    msg: "qmgr: queue scan clean, 0 deferred",
  },
  {
    id: "init-4",
    time: "23:01:15",
    status: "INF",
    msg: "smtpd: awaiting transmission...",
  },
];

const MAX_LOG_LINES = 10;

const MailLogPanel = forwardRef<MailLogHandle, { delay?: number }>(
  ({ delay = 0.4 }, ref) => {
    const mounted = useSyncExternalStore(
      emptySubscribe,
      () => true,
      () => false
    );

    const [entries, setEntries] = useState<MailLogEntry[]>(STATIC_INIT);

    useEffect(() => {
      const now = Date.now();
      setEntries([
        {
          ...STATIC_INIT[0],
          time: formatTime(new Date(now - 8200)),
        },
        {
          ...STATIC_INIT[1],
          time: formatTime(new Date(now - 6400)),
        },
        {
          ...STATIC_INIT[2],
          time: formatTime(new Date(now - 4100)),
        },
        {
          ...STATIC_INIT[3],
          time: formatTime(new Date(now - 1200)),
        },
      ]);
    }, []);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sentCount, setSentCount] = useState(1);
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll handler
    useEffect(() => {
      if (!isUserScrolledUp && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
    }, [entries, isUserScrolledUp]);

    const handleScroll = useCallback(() => {
      if (!scrollContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 24;
      setIsUserScrolledUp(!atBottom);
    }, []);

    // Imperative log function
    useImperativeHandle(
      ref,
      () => ({
        log: (status, msg, details) => {
          const entry: MailLogEntry = {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            time: formatTime(),
            status,
            msg,
            details,
          };

          if (status === "OK" && msg.includes("client handover")) {
            setSentCount((prev) => prev + 1);
          }

          setEntries((prev) => {
            const next = [...prev, entry];
            return next.length > MAX_LOG_LINES
              ? next.slice(-MAX_LOG_LINES)
              : next;
          });
        },
      }),
      []
    );

    // Idle daemon heartbeat
    useEffect(() => {
      let timeoutId: ReturnType<typeof setTimeout>;

      const scheduleNextHeartbeat = () => {
        const delayMs = 14000 + Math.random() * 16000; // 14s - 30s
        timeoutId = setTimeout(() => {
          const pick =
            IDLE_HEARTBEATS[
              Math.floor(Math.random() * IDLE_HEARTBEATS.length)
            ];
          setEntries((prev) => {
            const entry: MailLogEntry = {
              id: `heartbeat-${Date.now()}`,
              time: formatTime(),
              status: pick.status,
              msg: pick.msg,
            };
            const next = [...prev, entry];
            return next.length > MAX_LOG_LINES
              ? next.slice(-MAX_LOG_LINES)
              : next;
          });
          scheduleNextHeartbeat();
        }, delayMs);
      };

      scheduleNextHeartbeat();
      return () => clearTimeout(timeoutId);
    }, []);

    const toggleExpand = (id: string) => {
      setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
      <Panel delay={delay} className="flex flex-col h-full min-h-0 overflow-hidden">
        <PanelHead
          meta={
            <span className="flex items-center gap-[6px]">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--green)] animate-pulse" />
              <span>tail -f · mail.log</span>
            </span>
          }
        >
          <Dagger /> ~/{" "}
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>MAIL</b>
        </PanelHead>

        {/* Scrollable logs area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto flex flex-col gap-[5px] p-[10px_12px] min-h-0 z-10"
          style={{ fontFamily: "var(--mono)" }}
        >
          {entries.map((log) => {
            const hasDetails = Boolean(
              log.details && Object.keys(log.details).length > 0
            );
            const isExpanded = expandedId === log.id;

            return (
              <div key={log.id} className="flex flex-col min-w-0">
                <div
                  onClick={hasDetails ? () => toggleExpand(log.id) : undefined}
                  className={`flex items-start gap-[6px] text-[10px] leading-[1.6] min-w-0 rounded-xs transition-colors ${
                    hasDetails
                      ? "cursor-pointer hover:bg-[var(--red-hover-tint)] group px-[3px] -mx-[3px]"
                      : "px-[3px] -mx-[3px]"
                  }`}
                >
                  <span
                    style={{ color: "var(--text3)", flexShrink: 0 }}
                    className="tabular-nums"
                  >
                    {log.time}
                  </span>
                  <span
                    style={{
                      width: 24,
                      flexShrink: 0,
                      color: LEVEL_COLORS[log.status],
                      fontWeight: 600,
                    }}
                  >
                    {log.status}
                  </span>
                  <span
                    className="truncate flex-1 min-w-0"
                    style={{ color: "var(--text2)" }}
                    title={log.msg}
                  >
                    {log.msg}
                  </span>
                  {hasDetails && (
                    <span
                      className="text-[9px] shrink-0 transition-transform pt-[3px]"
                      style={{ color: "var(--text3)" }}
                    >
                      {isExpanded ? (
                        <ChevronDown size={10} />
                      ) : (
                        <ChevronRight size={10} />
                      )}
                    </span>
                  )}
                </div>

                {/* Expandable Tree Details */}
                {hasDetails && isExpanded && log.details && (
                  <div
                    className="flex flex-col ml-[28px] pl-[6px] border-l my-[2px] text-[9px] leading-[1.5]"
                    style={{
                      borderColor: "var(--border2)",
                      color: "var(--text3)",
                    }}
                  >
                    {Object.entries(log.details).map(([key, val], idx, arr) => {
                      const isLast = idx === arr.length - 1;
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-[4px] min-w-0"
                        >
                          <span style={{ color: "var(--border2)" }}>
                            {isLast ? "└─" : "├─"}
                          </span>
                          <span style={{ color: "var(--text2)" }}>{key}:</span>
                          <span
                            className="truncate font-mono"
                            style={{ color: "var(--amber)" }}
                          >
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Live blinking cursor prompt line */}
          <div className="flex items-center gap-[6px] text-[10px] pl-[3px] pt-[2px] shrink-0">
            <span
              style={{ color: "var(--text3)", flexShrink: 0 }}
              className="tabular-nums"
            >
              {mounted ? formatTime() : "23:01:15"}
            </span>
            <span
              style={{
                width: 24,
                flexShrink: 0,
                color: "var(--text3)",
                fontWeight: 600,
              }}
            >
              SYS
            </span>
            <span
              className="flex items-center gap-[4px] min-w-0"
              style={{ color: "var(--text3)" }}
            >
              <span>_</span>
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 11,
                  background: "var(--red)",
                  verticalAlign: "middle",
                  animation: "cur-blink 1.1s step-end infinite",
                }}
              />
            </span>
          </div>
        </div>

        {/* Daemon metrics footer bar */}
        <div
          className="px-[12px] py-[6px] border-t flex items-center justify-between text-[9px] tracking-[0.5px] uppercase shrink-0"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg2)",
            color: "var(--text3)",
            fontFamily: "var(--mono)",
          }}
        >
          <div className="flex items-center gap-[10px]">
            <span>
              queue: <b style={{ color: "var(--text2)" }}>0</b>
            </span>
            <span>
              sent: <b style={{ color: "var(--text2)" }}>{sentCount}</b>
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span>smtpd:</span>
            <span style={{ color: "var(--green)", fontWeight: 600 }}>active</span>
          </div>
        </div>
      </Panel>
    );
  }
);

MailLogPanel.displayName = "MailLogPanel";

export default MailLogPanel;
