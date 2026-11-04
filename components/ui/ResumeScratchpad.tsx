"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import { VscCloudDownload, VscZoomIn, VscZoomOut } from "react-icons/vsc";

export default function ResumeScratchpad() {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    document.dispatchEvent(new CustomEvent("resume-state", { detail: isOpen }));

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenResume = () => {
      setScale(1);
      setIsOpen((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("open-resume", handleOpenResume);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("open-resume", handleOpenResume);
    };
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(+(s + 0.25).toFixed(2), 3));
  const handleZoomOut = () => setScale((s) => Math.max(+(s - 0.25).toFixed(2), 0.5));
  const handleZoomReset = () => setScale(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed top-[36px] bottom-[27px] left-0 right-0 z-[40] flex items-center justify-center p-[8px] sm:p-[24px] bg-[var(--bg1)]"
          style={{
            background: "rgba(10, 9, 8, 0.85)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1200px] h-full md:h-[95%] relative flex flex-col"
          >
            <Panel delay={0} className="w-full h-full flex flex-col shadow-2xl">
              <PanelHead
                meta={
                  <div className="flex items-center gap-[10px] sm:gap-[16px]">
                    <div
                      className="flex items-center gap-[6px] sm:gap-[10px]"
                      style={{ color: "var(--text2)" }}
                    >
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        aria-label="Zoom out"
                        className="cursor-pointer hover:text-[var(--text)] transition-colors p-[2px]"
                      >
                        <VscZoomOut size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={handleZoomReset}
                        aria-label="Reset zoom"
                        className="cursor-pointer hover:text-[var(--text)] transition-colors text-[10px] sm:text-[11px] font-mono w-[36px] text-center"
                      >
                        {Math.round(scale * 100)}%
                      </button>
                      <button
                        type="button"
                        onClick={handleZoomIn}
                        aria-label="Zoom in"
                        className="cursor-pointer hover:text-[var(--text)] transition-colors p-[2px]"
                      >
                        <VscZoomIn size={15} />
                      </button>
                    </div>
                    <a
                      href="/resume.pdf"
                      download="Snehil_Gautam_Resume.pdf"
                      className="flex items-center gap-[5px] transition-colors cursor-pointer hover:text-[var(--text)] uppercase tracking-[1px] font-bold"
                      style={{ color: "var(--text2)" }}
                    >
                      <VscCloudDownload size={14} />
                      <span className="hidden sm:inline text-[11px] uppercase font-bold tracking-[1px]">
                        Download
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer transition-colors hover:text-[var(--red)] uppercase tracking-[1px] font-bold"
                      style={{ color: "var(--red-ember)" }}
                    >
                      [x] <span className="hidden sm:inline">esc</span>
                    </button>
                  </div>
                }
              >
                <Dagger /> ~/{" "}
                <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
                  RESUME
                </b>
              </PanelHead>
              <PanelBody
                className="flex-1 w-full h-full overflow-auto"
                style={{
                  padding: 0,
                  backgroundColor: "var(--bg)",
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-x pan-y pinch-zoom",
                }}
              >
                <div
                  className="min-w-full min-h-full flex flex-col p-[12px] sm:py-[32px] sm:px-[24px]"
                  onWheel={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      if (e.deltaY < 0) handleZoomIn();
                      else handleZoomOut();
                    }
                  }}
                >
                  <div
                    className="m-auto transition-[width] duration-150 ease-out"
                    style={{
                      width: `calc(min(100%, 850px) * ${scale})`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/resume-2.png"
                      alt="Snehil Gautam Resume"
                      className="w-full h-auto block select-none shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-[var(--bg)]"
                      draggable={false}
                    />
                  </div>
                </div>
              </PanelBody>
            </Panel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
