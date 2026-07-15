<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Rules — zaevo.dev (Antigravity Environment)

## Execution & Step Control
- Always verify path structures locally using the filesystem tools before editing.
- Do not execute arbitrary background watch scripts or server spawns unless modifying core environment configs.
- Read `CLAUDE.md` to synchronize with the design system, spacing tokens, and explicit constraints before proposing an execution plan.

## Before writing any code
- Respect the Unix-like filesystem architecture (FHS). Read CLAUDE.md before creating new files to ensure they are placed in the correct `sys`, `dev`, `bin`, or `usr` equivalent directory.
- Check the target component you're editing before modifying — don't assume class names.
- Prefer editing existing files over creating new ones.

## Styling & Typography Invariants
- Use exact px font sizes (`text-[14px]`, `text-[12px]`) not Tailwind named sizes (`text-base`, `text-sm`).
- Colors: always use the short CSS tokens (`var(--bg)`, `var(--text)`, `var(--red)`, `var(--red-ember)`) not old project vars or hardcoded hex lines.
- Fonts: Apply `--mono` for terminal grids/logs[cite: 1, 3]; `--sans` strictly for project/hero multi-line text descriptions[cite: 1, 2]; `--display` (`Pirata One`) exclusively for brand wordmark and journal `<h1>` headings — never for body or UI label text.
- Icons: `lucide-react` for standard UI elements, native inline components for brand logos[cite: 1].

## Workspace & Git Hygiene
- Never add `Co-Authored-By: Claude` or any other agentic signatures to commit messages.
- Never commit `MIGRATION.md` or `INSPIRATION.md` — these are local workspace assets only.
- Strict Commit Message Format: Use lowercase atomic commit messages matching this pattern: `type: short description`
- Allowed Commit Types:
  * `feat:` for new UI panels or core feature additions
  * `fix:` for layout breaking fixes or style corrections
  * `docs:` for markdown file updates (`CLAUDE.md`, etc.)
  * `style:` for design token additions, font alterations, or spacing tweaks
  * `refactor:` for rearranging component trees or routing logic
## Verification
- Never use curl or server-side terminal fetches to verify visual UI layout rendering.
- Complete the execution plan and request the human operator to check the preview server in the browser.