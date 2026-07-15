"use client";

import { useEffect, useState } from "react";
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

export default function WakaTimePanel({ delay = 0 }: { delay?: number }) {
  const [langs, setLangs] = useState<WakaLang[]>(FALLBACK);
  const [meta, setMeta] = useState("...");

  useEffect(() => {
    fetch("/api/sys/wakatime")
      .then((r) => r.json())
      .then((payload) => {
        if (payload.error) return;
        setLangs(payload.languages);
        setMeta(payload.total + " / 30d");
      })
      .catch(() => {});
  }, []);

  return (
    <Panel delay={delay}>
      <PanelHead meta={meta}>
        <Dagger /> <b style={{ color: "var(--text)" }}>WAKA</b> wakatime.log
      </PanelHead>
      <PanelBody>
        {langs.map((w, i) => (
          <div
            key={w.name}
            style={{ marginBottom: i === langs.length - 1 ? 0 : undefined }}
          >
            <WakaBar lang={w.name} pct={w.pct} text={w.text} />
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}
