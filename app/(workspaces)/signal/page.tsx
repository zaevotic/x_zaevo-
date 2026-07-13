import Panel, { PanelHead, PanelBody } from '@/components/ui/Panel';
import SpotifyPanel from '@/components/sys/signal/spotify';
import KeyboardPanel from '@/components/sys/signal/keyboard';

export default function SignalPage() {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-[14px] h-full">
      {/* SPOTIFY PANEL */}
      <Panel>
        <PanelHead>
          <span className="text-[10px] uppercase tracking-[.12em]" style={{ color: 'var(--red)' }}>♪</span>
          <span>spotify.live</span>
        </PanelHead>
        <PanelBody>
          <SpotifyPanel />
        </PanelBody>
      </Panel>

      {/* KEYBOARD PANEL */}
      <Panel>
        <PanelHead>
          <span className="text-[10px] uppercase tracking-[.12em]" style={{ color: 'var(--red)' }}>kbd</span>
          <span>niri_keybinds.conf</span>
        </PanelHead>
        <PanelBody>
          <KeyboardPanel />
        </PanelBody>
      </Panel>

      {/* HOW I THINK PANEL */}
      <Panel>
        <PanelHead>
          <span className="text-[10px] uppercase tracking-[.12em]" style={{ color: 'var(--red)' }}>mind</span>
          <span>how_i_think.md</span>
        </PanelHead>
        <PanelBody>
          <div className="flex flex-col gap-[14px]">
            {[
              { tag: 'systems', title: 'Abstractions should earn their keep', body: <>Every layer of abstraction costs something — latency, debuggability, mental model space. I only reach for one when the complexity it hides is <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>genuinely worse</em> than the complexity it introduces.</> },
              { tag: 'tooling', title: 'The tool should disappear', body: <>Good tooling is invisible. You notice it only when it's gone. That's what I aim for — interfaces that feel like an extension of thought rather than a layer in between.</> },
              { tag: 'learning', title: 'Build the thing, read the paper later', body: <>I learn best when there's something broken in front of me. Reading without a problem to anchor it is <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>expensive context with nowhere to go</em>. I prefer to collide with a concept first.</> },
              { tag: 'design', title: 'Aesthetic and function are not at odds', body: <>A terminal that looks right is easier to work in. Taste is a <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>forcing function</em> — it makes you care enough to get the detail right.</> }
            ].map((entry, idx, arr) => (
              <div key={idx} className="flex flex-col">
                <div className="border-l-[2px] pl-[12px] transition-colors hover:border-[var(--red-dim)]" style={{ borderColor: 'var(--border2)' }}>
                  <div className="text-[9px] tracking-[.1em] mb-[4px] flex gap-[8px]" style={{ color: 'var(--red)' }}>
                    <span className="px-[6px] py-[1px] rounded-[2px]" style={{ background: 'var(--red-mute)' }}>{entry.tag}</span>
                  </div>
                  <p className="text-[12px] mb-[5px]" style={{ color: 'var(--text)' }}>{entry.title}</p>
                  <p className="text-[11px] font-sans leading-[1.75]" style={{ color: 'var(--text2)' }}>{entry.body}</p>
                </div>
                {idx < arr.length - 1 && <hr className="border-t-[1px] border-b-0 border-l-0 border-r-0 my-[14px]" style={{ borderColor: 'var(--border)' }} />}
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>

      {/* WRITING / BLOG PANEL */}
      <Panel>
        <PanelHead>
          <span className="text-[10px] uppercase tracking-[.12em]" style={{ color: 'var(--red)' }}>blog</span>
          <span>writing.log</span>
        </PanelHead>
        <PanelBody>
          <p className="text-[10px] tracking-[.04em] mb-[12px]" style={{ color: 'var(--text3)' }}>
            // <span style={{ color: 'var(--amber)' }}>4 posts</span> · draft → publish pipeline
          </p>
          <div className="flex flex-col">
            {[
              { date: '2025-11-12', tag: 'systems', title: 'Designing a Semantic Filesystem Without an Agent', excerpt: 'Why the semantic layer in zaOS lives independently of any AI runtime, and how xattr can carry meaning at the kernel boundary without special-casing anything.' },
              { date: '2025-10-28', tag: 'wayland', title: 'Niri Is What I Wanted Sway to Be', excerpt: 'A month in with the scrollable-columns compositor. What the model gets right, where the rough edges are, and why I\'m not going back.' },
              { date: '2025-10-04', tag: 'tooling', title: 'Generating Animated SVGs with GitHub Actions', excerpt: 'Injecting live GraphQL stats into a fastfetch-style SVG and auto-committing via Actions. The full pipeline, the gotchas, and what I\'d do differently.' },
              { date: '2025-09-15', tag: 'rust', title: 'Why I Reach for Rust on Side Projects Now', excerpt: 'Not an essay about memory safety. About the feedback loop: the compiler as a collaborator that tells you exactly what you got wrong, immediately.' },
            ].map((post, idx, arr) => (
              <div key={idx} className="py-[10px] border-b-[1px] flex flex-col" style={{ borderColor: idx < arr.length - 1 ? 'var(--border)' : 'transparent' }}>
                <div className="flex justify-between items-center mb-[5px]">
                  <span className="text-[9px]" style={{ color: 'var(--text3)' }}>{post.date}</span>
                  <span className="text-[9px] px-[6px] py-[1px] rounded-[2px] tracking-[.06em] border" style={{ color: 'var(--amber)', background: '#2a1e0e', borderColor: '#3d2e14' }}>{post.tag}</span>
                </div>
                <p className="text-[12px] mb-[4px]" style={{ color: 'var(--text)' }}>{post.title}</p>
                <p className="text-[10px] font-sans leading-[1.6]" style={{ color: 'var(--text3)' }}>{post.excerpt}</p>
                <p className="text-[10px] mt-[6px] cursor-pointer" style={{ color: 'var(--red)' }}>read →</p>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}