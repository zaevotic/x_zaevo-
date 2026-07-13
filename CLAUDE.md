@AGENTS.md

# Portfolio — zaevo.dev

## Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Fonts: JetBrains Mono (`--mono`), Inter (`--sans`), Pirata One (`--display`) — all self-hosted via `next/font/google` (zero runtime CDN requests)
- Framer Motion for accordions, GSAP + ScrollTrigger for skill icons
- `lucide-react` for UI icons, custom inline elements for brand/tech layout primitives
- MDX via Fumadocs for blog posts

## Design System

### Typography Scale (Strict Custom Px Scaling)
Maintain high-density terminal alignment. Utilize explicit pixel constraints rather than standard naming hooks[cite: 1]:
- Body / descriptions / main inputs: `text-[14px]`[cite: 1]
- Secondary / muted annotations: `text-[13px]`[cite: 1]
- Panel items, values, code logs: `text-[12px]`[cite: 1]
- Mono status lines, labels, dates, topbar workspace navigation items: `text-[11px]`[cite: 1]
- Micro labels, priority tags, fine print metadata: `text-[9px]` or `text-[10px]`[cite: 1]
- Card titles, interface subsections, panel header subtitles: `text-[15px]`
- Nav logo branding: `text-[16px]`
- Call-to-Action section headers: `text-[20px] sm:text-[24px]`
- Section Title Names (e.g., Hero header): `text-[42px]`[cite: 1]

### Spacing Rhythm
- Section external container bounds: `py-8`[cite: 1]
- Inter-element panel grid gaps: `gap-6`[cite: 1]
- Footer/Statusbar data padding rows: `py-8 gap-8`[cite: 1]
- Dense layout stacks / row lists: `gap-2` or `gap-3`[cite: 1]

### Color Tokens (CSS / Tailwind Mapping)
Map these exact hex values inside your CSS variables file[cite: 1]:

**Backgrounds**
- `var(--bg)` — `#0a0908` (void — global app backdrop canvas)[cite: 1]
- `var(--bg1)` — `#120d0c` (panel — primary panel container backgrounds)[cite: 1]
- `var(--bg2)` — `#161010` (panel-alt — header accents, card backdrops, highlighted list cells)[cite: 1]
- `var(--bg3)` — `#1e1410` (high-density active interactive block layers)[cite: 1]

**Borders**
- `var(--border)` — `#2b1414` (base layout dividing borders)[cite: 1]
- `var(--border2)` — `#4a1a1f` (border-bright — high-contrast dividers and ghost buttons)[cite: 1]

**Text**
- `var(--text)` — `#d9d2c4` (bone — primary textual headers and fields)[cite: 1]
- `var(--text2)` — `#7a736a` (muted — body text and content summaries)[cite: 1]
- `var(--text3)` — `#4a453f` (muted-dim — faint labels, timestamp text, disabled markings)[cite: 1]

**Red accent family**
- `var(--red)` — `#b6182b` (primary interactive highlight accent and active state tokens)[cite: 1]
- `var(--red-ember)` — `#ff2436` (brightest red — hover glows, active dots, tab highlights)[cite: 1]
- `var(--red-dim)` — `#5c1018` (subtle indicator markers and item dot frames)[cite: 1]
- `var(--red-mute)` — `#3d1f18` (selected panel highlights and badge layers)[cite: 1]

**Secondary accents**
- `var(--amber)` — `#c47c2e` (secondary warning tags, code variables, and platform markings)[cite: 1]
- `var(--amber-dim)` — `#8a5420` (darker structural code/warning annotations)[cite: 1]
- `var(--green)` — `#5a8a4a` (Success text notifications, status indicators, and positive bounds)[cite: 1]
- `var(--green-dim)` — `#2e4a22` (Background fills for active notification slots)[cite: 1]

### Component Invariants
- **Layout Framework:** Implement an absolute window layout matrix utilizing fixed panel structural gaps. Never mix generic outer floating layers. 
- **Font Stack Harmony:** Always assign mono components to `--mono` (`JetBrains Mono`, `Fira Code` targets)[cite: 1]. Use `--sans` (`Inter` configurations) strictly for dense project description summaries. Use `--display` (`Pirata One`) exclusively for the brand wordmark and journal/blog `<h1>` headings — never for body text or UI labels.
- **Interactive States:** Active elements must use `var(--red)` text combined with `var(--red-mute)` bounding layers[cite: 1]. Ghost secondary inputs should use `var(--border2)` framing[cite: 1].
- **Visual Dividers:** Use standard thin lines styled via `var(--border)` or explicit micro-dot spacing flags to divide panel subsections[cite: 1].