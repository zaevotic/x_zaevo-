"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import { VscCloudDownload, VscClose, VscZoomIn, VscZoomOut } from "react-icons/vsc";

export default function ResumeScratchpad() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setScale(1); // Reset zoom when opened
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
      setIsOpen((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("open-resume", handleOpenResume);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("open-resume", handleOpenResume);
    };
  }, []);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 2.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.25));
  const handleZoomReset = () => setScale(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed top-[36px] bottom-[27px] left-0 right-0 z-[40] flex items-center justify-center p-[10px] sm:p-[24px]"
          style={{
            background: "rgba(5, 5, 5, 0.85)",
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
                  <div className="flex items-center gap-[16px]">
                    <div className="hidden md:flex items-center gap-[12px] mr-[8px]" style={{ color: "var(--text2)" }}>
                      <button onClick={handleZoomOut} className="cursor-pointer hover:text-[var(--text)] transition-colors"><VscZoomOut size={16} /></button>
                      <button onClick={handleZoomReset} className="cursor-pointer hover:text-[var(--text)] transition-colors text-[11px] font-mono w-[36px] text-center">
                        {Math.round(scale * 100)}%
                      </button>
                      <button onClick={handleZoomIn} className="cursor-pointer hover:text-[var(--text)] transition-colors"><VscZoomIn size={16} /></button>
                    </div>
                    <a
                      href="/resume.pdf"
                      download="Snehil_Gautam_Resume.pdf"
                      className="flex items-center gap-[6px] transition-colors cursor-pointer hover:text-[var(--text)] uppercase tracking-[1px] font-bold"
                      style={{ color: "var(--text2)" }}
                    >
                      <VscCloudDownload size={14} />
                      <span className="text-[11px] uppercase font-bold tracking-[1px]">Download</span>
                    </a>
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
                <Dagger /> <b style={{ color: "var(--text)" }}>~/resume.pdf</b>
              </PanelHead>
              <PanelBody 
                className="flex-1 w-full h-full overflow-auto" 
                style={{ 
                  padding: 0, 
                  backgroundColor: "var(--bg)", 
                  scrollbarWidth: "none", 
                  msOverflowStyle: "none" 
                }}
              >
                <style>{`.overflow-auto::-webkit-scrollbar { display: none; }`}</style>
                <div className="w-full min-h-full flex items-start justify-center">
                  <div 
                    className="transition-transform duration-200 ease-out py-[40px] px-[20px]"
                    style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
                  >
                    <img 
                      src="/resume.svg" 
                      alt="Snehil Gautam Resume" 
                      className="w-[850px] max-w-none shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-white"
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
