export const LEADERBOARD_CATEGORIES = ["time", "word", "quote"] as const;
export type MainCategory = (typeof LEADERBOARD_CATEGORIES)[number];

export type TimeSub = "15s" | "30s" | "60s";
export type WordSub = "10w" | "25w" | "50w";
export type QuoteSub = "short" | "medium" | "long";
export type SubCategory = TimeSub | WordSub | QuoteSub;

export const SUB_CATEGORIES: Record<
  MainCategory,
  { id: SubCategory; label: string }[]
> = {
  time: [
    { id: "15s", label: "15s" },
    { id: "30s", label: "30s" },
    { id: "60s", label: "60s" },
  ],
  word: [
    { id: "10w", label: "10w" },
    { id: "25w", label: "25w" },
    { id: "50w", label: "50w" },
  ],
  quote: [
    { id: "short", label: "short" },
    { id: "medium", label: "medium" },
    { id: "long", label: "long" },
  ],
};

export const DEFAULT_SUB: Record<MainCategory, SubCategory> = {
  time: "30s",
  word: "25w",
  quote: "short",
};

export interface ParsedMode {
  category: MainCategory;
  subCategory: SubCategory;
  label: string;
  subLabel: string;
}

/**
 * Parses any raw mode string into its canonical main category and subcategory.
 * Examples:
 * - "english · 30s" -> time, 30s
 * - "unix · 15s [+punct]" -> time, 15s
 * - "english · 25w" -> word, 25w
 * - "quote · short · Ken Thompson" -> quote, short
 * - "quote · Linus Torvalds" -> quote, medium
 */
export function parseLeaderboardMode(raw: string): ParsedMode {
  const s = (raw || "").trim();

  // 1. Quote
  if (
    s.toLowerCase().startsWith("quote") ||
    s.toLowerCase().includes("quote ·") ||
    s.toLowerCase().includes("quote:")
  ) {
    const after = s.replace(/^quote\s*[·:]\s*/i, "").trim();
    let sub: QuoteSub = "medium";

    if (
      after.toLowerCase().startsWith("short") ||
      after.toLowerCase().includes("ken thompson") ||
      after.toLowerCase().includes("zaevo") ||
      s.length < 125
    ) {
      sub = "short";
    } else if (
      after.toLowerCase().startsWith("long") ||
      after.toLowerCase().includes("doug mcilroy") ||
      after.toLowerCase().includes("brian kernighan") ||
      s.length > 165
    ) {
      sub = "long";
    }

    const cleanSource = after
      .replace(/^(short|medium|long)\s*[·:]\s*/i, "")
      .trim();

    return {
      category: "quote",
      subCategory: sub,
      label: cleanSource
        ? cleanSource.length > 16
          ? cleanSource.slice(0, 14) + "…"
          : cleanSource
        : "quote",
      subLabel: sub,
    };
  }

  // 2. Word (match: "vocab · Xw [mods]" or "X words" or "Xw")
  const wordMatch = s.match(
    /^(.+?)\s*·\s*(\d+)(?:w|\s*words)?(?:\s*(\[.*?\]))?$/i,
  );
  if (wordMatch || s.includes("word") || s.includes("w ")) {
    const numMatch = s.match(/(\d+)(?:w|\s*words)?/i);
    const count = numMatch ? parseInt(numMatch[1], 10) : 25;
    let sub: WordSub = "25w";
    if (count <= 15) sub = "10w";
    else if (count <= 35) sub = "25w";
    else sub = "50w";

    const vocab = wordMatch ? wordMatch[1].trim() : "english";
    const mods = wordMatch && wordMatch[3] ? ` ${wordMatch[3]}` : "";
    return {
      category: "word",
      subCategory: sub,
      label: `${vocab}${mods}`,
      subLabel: sub,
    };
  }

  // 3. Time (match: "vocab · Xs [mods]" or "timed" or "Xs")
  const timeMatch = s.match(
    /^(.+?)\s*·\s*(\d+)s(?:\s*timed)?(?:\s*(\[.*?\]))?$/i,
  );
  const numMatch = s.match(/(\d+)s/i);
  const sec = numMatch ? parseInt(numMatch[1], 10) : 30;
  let sub: TimeSub = "30s";
  if (sec <= 20) sub = "15s";
  else if (sec <= 45) sub = "30s";
  else sub = "60s";

  const vocab = timeMatch ? timeMatch[1].trim() : "english";
  const mods = timeMatch && timeMatch[3] ? ` ${timeMatch[3]}` : "";
  return {
    category: "time",
    subCategory: sub,
    label: `${vocab}${mods}`,
    subLabel: sub,
  };
}

