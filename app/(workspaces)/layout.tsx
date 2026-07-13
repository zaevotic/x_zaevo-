import MonitorBar from '@/components/ui/MonitorBar';
import StatusBar from '@/components/ui/StatusBar';
import LetterGlitch from '@/components/ui/LetterGlitch';

export default function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col relative z-0">
      <LetterGlitch />
      <MonitorBar />
      <main
        className="flex-1 overflow-hidden p-[14px] w-full"
      >
        {children}
      </main>
      <StatusBar />
    </div>
  );
}
