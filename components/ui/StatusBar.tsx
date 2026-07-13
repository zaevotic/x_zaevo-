'use client';

import { usePathname } from 'next/navigation';

const WS_MAP: Record<string, string> = {
  '/home':    '1:home',
  '/work':    '2:work',
  '/journal': '3:journal',
  '/term':    '4:term',
  '/contact': '5:contact',
  '/signal':  '6:signal',
};

function getDate() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function StatusBar() {
  const pathname = usePathname();
  const wsname = WS_MAP[pathname] ?? pathname.replace('/', '');

  return (
    <footer
      className="flex justify-between items-center px-[18px] py-[6px] border-t text-[10px] tracking-[0.5px] sticky bottom-0 z-50"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--bg2)',
        color: 'var(--text3)',
      }}
    >
      <div className="flex gap-[16px]">
        <span>
          WS{' '}
          <b style={{ color: 'var(--red-ember)' }}>{wsname}</b>
        </span>
        <span>niri</span>
      </div>
      <div>
        <span>zaevo@OMEN-erde</span>
        &nbsp;·&nbsp;
        <span>{getDate()}</span>
      </div>
    </footer>
  );
}
