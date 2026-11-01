# Journal Markdown Design (2026-07-16)

## Goal
Provide a dynamic journal/blog page that sources entries from plain Markdown/MDX files, enabling easy authoring via a local editor (VSCodium) while keeping the existing UI components.

## Directory placement (FHS compliance)
- **Path:** `app/api/usr/journal/journals/`
- This location lives under the `usr/` subtree, which CLAUDE.md defines for *user‑land data* and content APIs.
- The folder can be opened directly as a VSCodium workspace or added to an Obsidian vault if desired.

## File format
Each entry is a `.md` (or `.mdx`) file with front‑matter:
```yaml
---
date: 2025-11-12   # ISO date string
tag: systems        # free‑form tag used for UI filter
title: Designing a Semantic Filesystem Without an Agent
excerpt: >-
  Why the semantic layer in zaOS lives independently of any AI runtime, and how xattr can carry meaning at the kernel boundary without special‑casing anything.
---

# Article body
Markdown content goes here. Use MDX syntax if you need React components.
```
- Required fields map 1‑to‑1 with the `JournalPost` interface used by `RotatingJournal`.
- `excerpt` is a short summary displayed on the journal cards.

## Loader utility (`app/api/usr/journal/loader.ts`)
- Uses `import.meta.glob` (Vite/Next.js built‑in) to import *all* markdown files at build time.
- Parses front‑matter with `gray‑matter` (already a dependency of Fumadocs).
- Exports a `POSTS` constant of type `JournalPost[]`.
- No new runtime dependencies; fully static.

## Component integration
- In `app/(workspaces)/home/page.tsx` the static `POSTS` array is replaced by `import { POSTS } from "@/api/usr/journal/loader";`.
- `RotatingJournal` receives the dynamic array unchanged; UI remains identical.
- Adding/removing a markdown file automatically updates the UI after a rebuild.

## Development workflow
1. Open the vault at `app/api/usr/journal/journals/` with VSCodium.
2. Create a new `.md` file using your favorite template.
3. Run `npm run dev` (or `bun dev`). The loader picks up the file; the journal UI reflects the new entry.
4. For live updates without a full rebuild, enable ISR on the home page (optional).

## Future extensions (out of scope for now)
- **On‑demand revalidation** to avoid full rebuilds.
- **Pagination / tag filtering** by extending `RotatingJournal`.
- **Full MDX rendering** for individual blog pages (e.g., `/journal/[slug]`).

---
**Why this design** aligns with project constraints:
- No new dependencies beyond existing `gray-matter`.
- Respects the Unix‑like directory architecture (`usr/journal`).
- Enables authoring with VSCodium (or Obsidian) without an admin panel.
- Keeps the UI token‑light and fully typed.

*Please review the spec. Once approved I will generate the implementation plan.*
