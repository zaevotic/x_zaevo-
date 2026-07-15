"use client";

import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";

export default function WorkPage() {
  return (
    <div className="h-full flex items-center justify-center p-[24px]">
      <Panel delay={0.1} className="w-full max-w-[500px]">
        <PanelHead meta="work.exe">
          <Dagger /> ~/{" "}
          <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
            CONSTRUCTION
          </b>
        </PanelHead>
        <PanelBody className="flex flex-col items-center justify-center py-[64px] text-center">
          <div
            className="text-[48px] mb-[24px] select-none opacity-80 filter grayscale"
            style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.1)" }}
          >
            🚧
          </div>
          <h2
            className="text-[14px] font-bold tracking-[3px] uppercase mb-[12px]"
            style={{ color: "var(--red)", fontFamily: "var(--mono)" }}
          >
            Under Construction
          </h2>
          <p
            className="text-[12px] max-w-[40ch] leading-[1.6]"
            style={{ color: "var(--text2)" }}
          >
            The work directory is currently being refactored. Check back later
            for case studies and deeper dives into the architecture.
          </p>
          <div
            className="mt-[32px] pt-[24px] border-t w-[80%] flex justify-center"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-[10px] tracking-[1.5px] uppercase"
              style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}
            >
              &gt; aborting process...
            </p>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
