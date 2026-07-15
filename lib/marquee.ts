export type MarqueeCategory = "meta" | "mood" | "system" | "interactive";

export interface MarqueeStatement {
  text: string;
  category: MarqueeCategory;
}

export const MARQUEE_DB: MarqueeStatement[] = [
  // Meta
  {
    text: "> this page has been rebuilt more times than I can count",
    category: "meta",
  },
  { text: "> you're viewing commit a3f9c12", category: "meta" },
  { text: "> yes, this greentext is rotating in real time", category: "meta" },
  { text: "> compiling personality... done", category: "meta" },
  { text: "> if you're reading this, hi", category: "meta" },
  { text: "> don't stop here, there's more", category: "meta" },
  {
    text: "> this line was AI-assisted. the bug below wasn't",
    category: "meta",
  },

  // Mood
  { text: "> mood: shipping", category: "mood" },
  { text: "> mood: three coffees deep", category: "mood" },
  { text: "> mood: cautiously optimistic about the build", category: "mood" },
  { text: "> mood: one more feature then i'll stop", category: "mood" },
  { text: "> my desperation knows no bounds", category: "mood" },

  // System
  { text: "> bun run dev has been running since Tuesday", category: "system" },
  { text: "> works on my machine (OMEN-erde)", category: "system" },
  { text: "> TODO: fix the todo list", category: "system" },

  // Interactive
  { text: "> nice cursor you've got there", category: "interactive" },
  { text: "> yes I see you inspecting element", category: "interactive" },
  { text: "> hover a bit longer, I dare you", category: "interactive" },
];

export const PALETTE = [
  "var(--text)",
  "var(--text2)",
  "var(--text3)",
  "var(--red)",
  "var(--red-ember)",
  "var(--amber)",
];

export interface MarqueeSequenceItem {
  text: string;
  color: string;
}

/**
 * An engine to generate engaging sequences of marquee statements.
 * Ensures variety by mixing categories and preventing consecutive repeats of the same category.
 */
export function generateMarqueeSequence(
  length: number = 10,
): MarqueeSequenceItem[] {
  const sequence: MarqueeSequenceItem[] = [];
  let lastCategory: MarqueeCategory | null = null;
  let lastColor: string | null = null;

  // Clone the DB so we can consume items to prevent exact text repeats in the same strip
  let available = [...MARQUEE_DB];

  for (let i = 0; i < length; i++) {
    if (available.length === 0) {
      available = [...MARQUEE_DB]; // refill if we exhausted the pool
    }

    // Try to pick an item from a DIFFERENT category than the last one
    let candidates = available.filter((s) => s.category !== lastCategory);

    // Fallback if somehow only one category remains
    if (candidates.length === 0) {
      candidates = available;
    }

    // Pick a random statement from the candidates
    const pickIndex = Math.floor(Math.random() * candidates.length);
    const pick = candidates[pickIndex];

    // Pick a random color from the palette (try to avoid consecutive same colors)
    let colorCandidates = PALETTE.filter((c) => c !== lastColor);
    if (colorCandidates.length === 0) colorCandidates = PALETTE;
    const pickColor =
      colorCandidates[Math.floor(Math.random() * colorCandidates.length)];

    sequence.push({ text: pick.text, color: pickColor });

    lastCategory = pick.category;
    lastColor = pickColor;

    // Remove the picked item from available pool so it's not repeated exactly
    available = available.filter((s) => s.text !== pick.text);
  }

  return sequence;
}
