import MonitorBar from "@/components/ui/MonitorBar";
import StatusBar from "@/components/ui/StatusBar";
import LetterGlitch from "@/components/ui/LetterGlitch";
import JournalScratchpad from "@/components/ui/JournalScratchpad";
import ResumeScratchpad from "@/components/ui/ResumeScratchpad";

export default function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col relative z-0">
      <LetterGlitch />
      <MonitorBar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-[10px] w-full after:block after:h-[1px] after:mt-[-1px]">{children}</main>
      <StatusBar />
      <JournalScratchpad />
      <ResumeScratchpad />
    </div>
  );
}
