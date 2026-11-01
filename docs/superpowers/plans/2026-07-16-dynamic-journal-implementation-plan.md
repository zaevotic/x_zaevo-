# Dynamic Journal (Markdown) Implementation Plan

> **For agentic workers:** REQUIRED SUB‑SKILL: Use `superpowers:subagent‑driven‑development` (recommended) or `superpowers:executing‑plans` to implement this plan task‑by‑task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the journal page load its posts from plain Markdown/MDX files (an Obsidian‑compatible/vscodium‑editable vault) instead of a hard‑coded array.

**Architecture:**
- Store journal entries as `.md` (or `.mdx`) files under `app/api/usr/journal/journals/`.
- A tiny loader (`app/api/usr/journal/loader.ts`) uses `import.meta.glob` + `gray-matter` to read all files at build time, extract front‑matter, and export a `POSTS` array matching the `JournalPost` interface.
- `RotatingJournal` receives this dynamic `POSTS` via an import; UI stays unchanged.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, Fumadocs (MDX rendering), `gray-matter` (already a dependency).

## Global Constraints
- Files must live under the `usr/` subtree per CLAUDE.md.
- Use exact pixel‑based Tailwind utilities (`text-[14px]`, `var(--bg)`, etc.) – no Tailwind named sizes.
- No new runtime dependencies beyond the existing `gray-matter`.
- Follow repository naming conventions (camelCase for variables, PascalCase for components).

---

### Task 1: Create the journal vault directory
**Files:**
- **Create:** `app/api/usr/journal/journals/` (directory, no files yet).

**Steps:**
- [ ] `mkdir -p app/api/usr/journal/journals`
- [ ] Verify the path exists with `ls app/api/usr/journal/journals`.

### Task 2: Add a sample markdown entry
**Files:**
- **Create:** `app/api/usr/journal/journals/2025-11-12-designing-semantic-filesystem.md`

**Content:**
```markdown
---
date: 2025-11-12
tag: systems
title: Designing a Semantic Filesystem Without an Agent
excerpt: >-
  Why the semantic layer in zaOS lives independently of any AI runtime, and how xattr can carry meaning at the kernel boundary without special-casing anything.
---

Your article content goes here. Use Markdown or MDX as you wish.
```

**Steps:**
- [ ] Write the file with the exact content above.
- [ ] Run `cat` to confirm the front‑matter is correct.

### Task 3: Implement the loader utility
**Files:**
- **Create:** `app/api/usr/journal/loader.ts`

**Content:**
```ts
// Loader for journal markdown files – builds the POSTS array for RotatingJournal
import matter from "gray-matter";

type JournalPost = {
  date: string;
  tag: string;
  title: string;
  excerpt: string;
};

export const POSTS: JournalPost[] = Object.values(
  import.meta.glob("./journals/*.md", { eager: true })
).map((mod: any) => {
  const { data } = matter(mod.default);
  return {
    date: data.date,
    tag: data.tag,
    title: data.title,
    excerpt: data.excerpt,
  } as JournalPost;
});
```

**Steps:**
- [ ] Create the file with the exact content above.
- [ ] Run the project’s type‑check (`npm run lint` or `tsc --noEmit`) to ensure no type errors.

### Task 4: Update the home page to use the dynamic loader
**Files:**
- **Modify:** `app/(workspaces)/home/page.tsx`

**Changes:**
1. Add an import after the existing UI imports:
   ```ts
   import { POSTS } from "@/api/usr/journal/loader";
   ```
2. Remove the static `const POSTS = [...]` block (already replaced).

**Steps:**
- [ ] Open `app/(workspaces)/home/page.tsx`.
- [ ] Insert the import line after line 10 (before the `// ── Data ──` comment).
- [ ] Verify the file compiles (`npm run lint && npm run build`).

### Task 5: Verify the UI renders journal entries
**Files:** *No new files* – just run the dev server.

**Steps:**
- [ ] Start the dev server (`npm run dev`).
- [ ] Open the home page in a browser.
- [ ] Confirm `RotatingJournal` shows the sample entry’s title, date, tag, and excerpt.
- [ ] Add a second markdown file with different data, refresh, and verify it appears.

### Task 6: Add a README note for the vault
**Files:**
- **Create:** `app/api/usr/journal/README.md`

**Content:**
```markdown
# Journal Vault

Place one `.md` (or `.mdx`) file per journal entry here.

Required front‑matter fields:
- `date` (ISO string)
- `tag` (string)
- `title` (string)
- `excerpt` (string, short summary)

The loader (`loader.ts`) reads all files automatically.
```

**Steps:**
- [ ] Write the README with the exact content above.

### Task 7: Add a loader test (optional but helpful)
**Files:**
- **Create:** `tests/journal/loader.test.ts`

**Test (Jest):**
```ts
import { POSTS } from "@/api/usr/journal/loader";

test("loader returns at least one post with required fields", () => {
  expect(POSTS.length).toBeGreaterThan(0);
  const post = POSTS[0];
  expect(post).toHaveProperty("date");
  expect(post).toHaveProperty("tag");
  expect(post).toHaveProperty("title");
  expect(post).toHaveProperty("excerpt");
});
```

**Steps:**
- [ ] Add the test file with the exact content.
- [ ] Run the test command (`npm test` or project‑specific) and ensure it passes.

---

**Execution options:**
1. **Subagent‑Driven (recommended)** – I will spawn a fresh subagent for each task, review its output, and proceed to the next.
2. **Inline Execution** – I will perform the tasks directly in this session using the `superpowers:executing‑plans` skill.

**Note:** No commits will be made until you explicitly instruct me to do so.

---

*Please let me know which execution approach you’d like to use, or if you’d like any adjustments to the plan before proceeding.*