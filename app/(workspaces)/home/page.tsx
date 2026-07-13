import Panel, { PanelHead, PanelBody, Dagger } from '@/components/ui/Panel';
import StatRow from '@/components/sys/dev/dsp';

// ── Data ──────────────────────────────────────────────────────────────────────

const TAGS = [
  'Rust', 'Python', 'TypeScript', 'C/C++',
  'Arch Linux', 'Niri', 'Bash',
];

const FOCUS = [
  {
    title: 'Literally this portfolio',
    desc: 'Merging the workspace shell with the project-card narrative layer',
    pill: 'in progress',
  },
  {
    title: 'Quickshell Desktop Shell',
    desc: 'QML · Niri compositor · warm dark aesthetic',
    pill: 'building',
  },
  {
    title: 'zaOS Architecture',
    desc: 'semantic filesystem · xattr · x86 implementation',
    pill: 'research',
  },
];

const AVAIL = [
  { k: 'internships', v: 'yes' },
  { k: 'open source', v: 'yes' },
  { k: 'freelance',   v: 'selective' },
  { k: 'full-time',   v: '2027' },
  { k: 'response time', v: '~24-48h' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col gap-[14px]">

      {/* Row 1 — Hero + Now */}
      <div
        className="grid gap-[14px]"
        style={{ gridTemplateColumns: '1.4fr 1fr' }}
      >
        {/* Hero panel */}
        <Panel>
          <PanelHead meta="fastfetch">
            <Dagger /> ~/ <b style={{ color: 'var(--text)', letterSpacing: '1px' }}>hero.md</b>
          </PanelHead>
          <PanelBody>
            <p
              className="text-[11px] tracking-[3px] uppercase mb-[4px]"
              style={{ color: 'var(--red)' }}
            >
              // portfolio
            </p>
            {/* Wordmark */}
            <h1
              className="text-[64px] leading-none mb-[4px]"
              style={{
                fontFamily: 'var(--display)',
                color: 'var(--text)',
                textShadow: '0 0 30px rgba(255,36,54,0.25)',
              }}
            >
              Snehil Gautam
            </h1>
            <p className="text-[12px] mb-[18px]" style={{ color: 'var(--text2)' }}>
              <b style={{ color: 'var(--red-ember)', fontWeight: 500 }}>@zaevotic</b>
              {' '}· IIT Jodhpur · Artificial Intelligence and Data Science
            </p>
            {/* Bio — greentext style */}
            <div
              className="text-[13px] mb-[24px]"
              style={{
                fontFamily: 'var(--mono)',
                color: 'var(--text2)',
                lineHeight: '1.75',
                maxWidth: '65ch',
              }}
            >
              <p style={{ color: 'var(--text3)' }}>// bio.greentext</p>
              <p>&gt; Be me</p>
              <p>&gt; AI &amp; Data Science engineering student at IIT Jodhpur</p>
              <p>&gt; Obsessed with custom <span style={{ color: 'var(--red-ember)' }}>Arch Linux environments</span>,{' '} <span style={{ color: 'var(--red-ember)' }}>System Architecture</span> and{' '} <span style={{ color: 'var(--red-ember)' }}>OS level shenanigans</span></p>
              <p>&gt; Build the thing, read the paper later</p>
              <p>&gt; Profit</p>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-[8px] mb-[22px]">
              {TAGS.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-[10px] py-[5px] border tracking-[0.5px]"
                  style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </PanelBody>
        </Panel>

        {/* Now — status.live */}
        <Panel>
          <PanelHead>
            <Dagger /> <b style={{ color: 'var(--text)' }}>NOW</b> status.live
          </PanelHead>
          <PanelBody>
            <StatRow
              label={
                <span className="flex items-center">
                  status
                </span>
              }
              value="online"
            />
            <StatRow label="location"   value="Jodhpur, Rajasthan" />
            <StatRow label="machine"    value="OMEN-erde / Arch" />
            <StatRow label="listening to" value="Daft Punk — Something About Us" />
            <StatRow label="last commit" value="feat: cut-panel UI pass" noBorder />
          </PanelBody>
        </Panel>
      </div>

      {/* Row 2 — Focus + Availability */}
      <div
        className="grid gap-[14px]"
        style={{ gridTemplateColumns: '1fr 1fr' }}
      >
        {/* Focus panel */}
        <Panel>
          <PanelHead meta="3 active">
            <Dagger /> <b style={{ color: 'var(--text)' }}>FOCUS</b> current_focus.txt
          </PanelHead>
          <PanelBody>
            {FOCUS.map((f) => (
              <div
                key={f.title}
                className="border-l-2 px-[12px] py-[10px] mb-[10px] last:mb-0"
                style={{
                  borderColor: 'var(--red-dim)',
                  background: 'rgba(182,24,43,0.03)',
                }}
              >
                <p className="text-[12px] font-semibold mb-[4px]" style={{ color: 'var(--text)' }}>
                  {f.title}
                </p>
                <p className="text-[10px] mb-[8px]" style={{ color: 'var(--text2)' }}>
                  {f.desc}
                </p>
                <span
                  className="text-[9px] tracking-[0.5px] uppercase px-[7px] py-[2px] border"
                  style={{ borderColor: 'var(--border2)', color: 'var(--red-ember)' }}
                >
                  {f.pill}
                </span>
              </div>
            ))}
          </PanelBody>
        </Panel>

        {/* Availability panel */}
        <Panel>
          <PanelHead>
            <Dagger /> <b style={{ color: 'var(--text)' }}>AVAIL</b> open_to.cfg
          </PanelHead>
          <PanelBody>
            {/* Open indicator */}
            <div
              className="flex items-center gap-[10px] px-[14px] py-[12px] border mb-[14px]"
              style={{
                background: 'linear-gradient(90deg, rgba(182,24,43,0.14), transparent)',
                borderColor: 'var(--border2)',
              }}
            >
              <span
                className="text-[12px] tracking-[1px] uppercase"
                style={{ color: 'var(--text)' }}
              >
                open to opportunities
              </span>
            </div>
            {AVAIL.map((row, i) => (
              <StatRow
                key={row.k}
                label={row.k}
                value={row.v}
                noBorder={i === AVAIL.length - 1}
              />
            ))}
          </PanelBody>
        </Panel>
      </div>

    </div>
  );
}
