"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import WakaBar from "@/components/sys/log/wakatime";

interface WakaLang {
  name: string;
  pct: number;
  text: string;
}

const FALLBACK: WakaLang[] = [
  { name: "Rust", pct: 34.1, text: "" },
  { name: "C++", pct: 24.5, text: "" },
  { name: "TypeScript", pct: 17.6, text: "" },
  { name: "QML", pct: 11.3, text: "" },
  { name: "Bash", pct: 4.7, text: "" },
];

let cachedWaka: { langs: WakaLang[]; meta: string } | null = null;

export default function WakaTimePanel({ delay = 0 }: { delay?: number }) {
  const [langs, setLangs] = useState<WakaLang[]>(() => cachedWaka?.langs ?? []);
  const [loading, setLoading] = useState(!cachedWaka);
  const [meta, setMeta] = useState(() => cachedWaka?.meta ?? "syncing...");

  useEffect(() => {
    fetch("/api/sys/wakatime")
      .then((r) => r.json())
      .then((payload) => {
        if (
          payload.error ||
          !Array.isArray(payload.languages) ||
          payload.languages.length === 0
        ) {
          setLangs(FALLBACK);
          const m = "cached / 30d";
          setMeta(m);
          cachedWaka = { langs: FALLBACK, meta: m };
          return;
        }
        setLangs(payload.languages);
        const m = `${payload.total || "0 hrs"} / ${payload.range || "30d"}`;
        setMeta(m);
        cachedWaka = { langs: payload.languages, meta: m };
      })
      .catch(() => {
        setLangs(FALLBACK);
        const m = "cached / 30d";
        setMeta(m);
        cachedWaka = { langs: FALLBACK, meta: m };
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Panel delay={delay}>
      <PanelHead meta={`${meta} · wakatime.log`}>
        <Dagger /> ~/{" "}
        <b style={{ color: "var(--text)", letterSpacing: "1px" }}>WAKA</b>
      </PanelHead>
      <PanelBody>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="waka-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-[11px]"
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="opacity-40 animate-pulse">
                  <div className="flex justify-between text-[11px] mb-[5px]">
                    <div
                      className="h-[10px] w-[30%] rounded-[2px]"
                      style={{ background: "var(--border2)" }}
                    />
                    <div
                      className="h-[10px] w-[15%] rounded-[2px]"
                      style={{ background: "var(--border2)" }}
                    />
                  </div>
                  <div
                    className="h-[5px] border"
                    style={{
                      background: "var(--bg2)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="waka-content"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {langs.map((w, i) => (
                <div
                  key={w.name}
                  style={{
                    marginBottom: i === langs.length - 1 ? 0 : undefined,
                  }}
                >
                  <WakaBar
                    lang={w.name}
                    pct={w.pct}
                    text={w.text}
                    delay={i * 0.08}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </PanelBody>
    </Panel>
  );
}
