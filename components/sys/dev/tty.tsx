"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Shuffle, Zap, CheckCircle2, Terminal, Trophy } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import type { LeaderboardEntry } from "@/components/sys/log/leaderboard";

// ── TermLine ──────────────────────────────────────────────────────────────────
interface TermLineProps {
  user?: string;
  host?: string;
  cwd?: string;
  cmd?: string;
}

export function TermLine({
  user = "zaevo",
  host = "OMEN-erde",
  cwd = "~",
  cmd,
}: TermLineProps) {
  return (
    <div
      className="text-[12px] mb-[5px] leading-[1.7]"
      style={{ fontFamily: "var(--mono)" }}
    >
      <span style={{ color: "var(--red-ember)" }}>{user}</span>
      <span style={{ color: "var(--text2)" }}>
        @{host} {cwd} $
      </span>
      {cmd && <span style={{ color: "var(--text)" }}> {cmd}</span>}
    </div>
  );
}

// ── TermOut ───────────────────────────────────────────────────────────────────
interface TermOutProps {
  children: React.ReactNode;
}

export function TermOut({ children }: TermOutProps) {
  return (
    <div
      className="text-[12px] mb-[12px] leading-[1.7]"
      style={{ color: "var(--text2)", fontFamily: "var(--mono)" }}
    >
      {children}
    </div>
  );
}

// ── TermKv ────────────────────────────────────────────────────────────────────
interface TermKvProps {
  k: string;
  v: string;
}

export function TermKv({ k, v }: TermKvProps) {
  return (
    <div className="text-[11px]">
      <span className="inline-block w-[80px]" style={{ color: "var(--text3)" }}>
        {k}
      </span>
      <span style={{ color: "var(--text2)" }}>{v}</span>
    </div>
  );
}

// ── LogLine ───────────────────────────────────────────────────────────────────
interface LogLineProps {
  time: string;
  tag: string;
  message: string;
}

export function LogLine({ time, tag, message }: LogLineProps) {
  return (
    <div className="text-[11px] mb-[5px]" style={{ color: "var(--text2)" }}>
      {time}
      <span className="mx-[8px]" style={{ color: "var(--red-ember)" }}>
        {tag}
      </span>
      {message}
    </div>
  );
}

// ── TypingTerminal (High-Performance Monkeytype TUI) ──────────────────────────

export type TestMode = "time" | "words" | "quote";
export type VocabType = "english" | "unix";

const ENGLISH_WORDS = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it",
  "that", "for", "they", "with", "as", "not", "on", "she", "at", "by",
  "this", "we", "you", "do", "but", "from", "or", "which", "one", "would",
  "all", "will", "there", "say", "who", "make", "when", "can", "more", "if",
  "no", "man", "out", "other", "so", "what", "time", "up", "go", "about",
  "than", "into", "could", "state", "only", "new", "year", "some", "take", "come",
  "these", "know", "see", "use", "get", "like", "then", "first", "any", "work",
  "now", "may", "such", "give", "over", "think", "most", "even", "find", "day",
  "also", "after", "way", "many", "must", "look", "before", "great", "back", "through",
  "long", "where", "much", "should", "well", "people", "down", "own", "just", "because",
  "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little",
  "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become",
  "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under",
  "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin",
  "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form",
  "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest",
  "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again",
  "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however",
  "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact",
  "group", "play", "stand", "increase", "early", "course", "change", "help", "line", "signal",
];

const UNIX_WORDS = [
  "kernel", "daemon", "socket", "buffer", "thread", "mutex", "atomic", "pointer", "struct", "alloc",
  "syscall", "epoll", "async", "await", "future", "stream", "pipewire", "wayland", "compositor", "shader",
  "vertex", "matrix", "tensor", "vector", "gradient", "epoch", "weights", "policy", "reward", "packet",
  "router", "subnet", "bridge", "tunnel", "cipher", "pubkey", "digest", "commit", "branch", "rebase",
  "merge", "stash", "cherry", "origin", "remote", "binary", "elf", "linker", "symbol", "offset",
  "register", "stack", "heap", "frame", "paging", "virtual", "inode", "dentry", "vfs", "btrfs",
  "subvol", "snapshot", "journal", "systemd", "target", "service", "timer", "cgroup", "namespace", "chroot",
  "pacman", "makepkg", "pkgbuild", "aur", "neovim", "lua", "treesitter", "lsp", "clangd", "rustup",
  "cargo", "crate", "trait", "impl", "borrow", "lifetime", "slice", "option", "result", "unwrap",
  "match", "enum", "macro", "derive", "serde", "tokio", "hyper", "axum", "nextjs", "react",
  "tailwind", "drizzle", "sqlite", "pragma", "index", "query", "schema", "cursor", "stdin", "stdout",
  "stderr", "tty", "pty", "termios", "sigint", "sigterm", "sigkill", "sigsegv", "fork", "execve",
];

const QUOTES: {
  source: string;
  text: string;
  tier: "short" | "medium" | "long";
}[] = [
  {
    source: "Ken Thompson // Bell Labs",
    text: "one of my most productive days was throwing away one thousand lines of code. when in doubt, use brute force.",
    tier: "short",
  },
  {
    source: "zaevo // OMEN-erde",
    text: "abstractions must earn their keep or they get deleted. taste is the forcing function for getting every low level detail right.",
    tier: "short",
  },
  {
    source: "Linus Torvalds // LKML",
    text: "talk is cheap. show me the code. bad programmers worry about the code. good programmers worry about data structures and their relationships.",
    tier: "medium",
  },
  {
    source: "Richard Feynman // Caltech",
    text: "what i cannot create, i do not understand. study hard what interests you the most in the most undisciplined, irreverent and original manner possible.",
    tier: "medium",
  },
  {
    source: "Unix Philosophy // Doug McIlroy",
    text: "write programs that do one thing and do it well. write programs to work together. write programs to handle text streams, because that is a universal interface.",
    tier: "long",
  },
  {
    source: "Brian Kernighan // C Programming",
    text: "debugging is twice as hard as writing the code in the first place. therefore, if you write the code as cleverly as possible, you are by definition not smart enough to debug it.",
    tier: "long",
  },
];

const PUNCTUATION_MARKS = [",", ".", ";", ":", "!", "?"];

function generateWordStream(
  count: number,
  vocab: VocabType,
  usePunctuation: boolean,
  useNumbers: boolean,
  seedOffset = 0,
): string {
  const pool = vocab === "unix" ? UNIX_WORDS : ENGLISH_WORDS;
  const result: string[] = [];
  let capitalizeNext = usePunctuation;

  for (let i = 0; i < count; i++) {
    const r1 = seedOffset === -1 ? ((i * 37 + 13) % 100) / 100 : Math.random();
    const r2 = seedOffset === -1 ? ((i * 53 + 29) % 100) / 100 : Math.random();
    const r3 = seedOffset === -1 ? ((i * 71 + 41) % 100) / 100 : Math.random();

    if (useNumbers && r1 < 0.12) {
      const num = Math.floor(r2 * 900) + 10;
      result.push(String(num));
      capitalizeNext = false;
      continue;
    }

    let word = pool[Math.floor(r1 * pool.length)];

    if (usePunctuation && capitalizeNext && word.length > 0) {
      word = word[0].toUpperCase() + word.slice(1);
      capitalizeNext = false;
    }

    if (usePunctuation && i < count - 1 && r2 < 0.22) {
      const mark =
        PUNCTUATION_MARKS[Math.floor(r3 * PUNCTUATION_MARKS.length)];
      word = word + mark;
      if (mark === "." || mark === "!" || mark === "?") {
        capitalizeNext = true;
      }
    } else if (usePunctuation && i === count - 1) {
      word = word + ".";
    }

    result.push(word);
  }

  return result.join(" ");
}

function formatWordsFromList(
  words: string[],
  usePunctuation: boolean,
  useNumbers: boolean,
): string {
  const result: string[] = [];
  let capitalizeNext = usePunctuation;

  for (let i = 0; i < words.length; i++) {
    const r1 = Math.random();
    const r2 = Math.random();
    const r3 = Math.random();

    if (useNumbers && r1 < 0.12) {
      const num = Math.floor(r2 * 900) + 10;
      result.push(String(num));
      capitalizeNext = false;
      continue;
    }

    let word = words[i];

    if (usePunctuation && capitalizeNext && word.length > 0) {
      word = word[0].toUpperCase() + word.slice(1);
      capitalizeNext = false;
    }

    if (usePunctuation && i < words.length - 1 && r2 < 0.22) {
      const mark =
        PUNCTUATION_MARKS[Math.floor(r3 * PUNCTUATION_MARKS.length)];
      word = word + mark;
      if (mark === "." || mark === "!" || mark === "?") {
        capitalizeNext = true;
      }
    } else if (usePunctuation && i === words.length - 1) {
      word = word + ".";
    }

    result.push(word);
  }

  return result.join(" ");
}

function charToKeyCode(ch: string | undefined): string | null {
  if (!ch) return null;
  if (ch === " ") return "Space";
  const lower = ch.toLowerCase();
  if (lower >= "a" && lower <= "z") {
    return `Key${lower.toUpperCase()}`;
  }
  if (ch >= "0" && ch <= "9") {
    return `Digit${ch}`;
  }
  const map: Record<string, string> = {
    "`": "Backquote",
    "~": "Backquote",
    "-": "Minus",
    "_": "Minus",
    "=": "Equal",
    "+": "Equal",
    "[": "BracketLeft",
    "{": "BracketLeft",
    "]": "BracketRight",
    "}": "BracketRight",
    "\\": "Backslash",
    "|": "Backslash",
    ";": "Semicolon",
    ":": "Semicolon",
    "'": "Quote",
    '"': "Quote",
    ",": "Comma",
    "<": "Comma",
    ".": "Period",
    ">": "Period",
    "/": "Slash",
    "?": "Slash",
    "!": "Digit1",
    "@": "Digit2",
    "#": "Digit3",
    "$": "Digit4",
    "%": "Digit5",
    "^": "Digit6",
    "&": "Digit7",
    "*": "Digit8",
    "(": "Digit9",
    ")": "Digit0",
  };
  return map[ch] ?? null;
}

function formatKeyLabel(ch: string | undefined): string {
  if (!ch) return "END";
  if (ch === " ") return "SPC";
  return ch;
}

// ── Memoized Word Token (prevents re-rendering untouched words on keypress) ──

interface WordTokenProps {
  wordWithSpace: string;
  startIndex: number;
  typedSlice: string;
  cursorOffset: number; // -1 if cursor is not inside this word token
  isFullyUntyped: boolean;
  cursorRef?: React.RefObject<HTMLSpanElement | null>;
}

const WordToken = memo(function WordToken({
  wordWithSpace,
  typedSlice,
  cursorOffset,
  isFullyUntyped,
  cursorRef,
}: WordTokenProps) {
  if (isFullyUntyped && cursorOffset === -1) {
    return <span style={{ color: "var(--text3)" }}>{wordWithSpace}</span>;
  }

  return (
    <span>
      {wordWithSpace.split("").map((char, idx) => {
        const isCurrent = idx === cursorOffset;
        const isTyped = idx < typedSlice.length;
        const typedChar = typedSlice[idx];
        const isWrong = isTyped && typedChar !== char;

        if (isCurrent) {
          return (
            <span
              key={idx}
              ref={cursorRef}
              className="animate-pulse"
              style={{
                background: "var(--red)",
                color: "var(--bg)",
                padding: "1px 0",
              }}
            >
              {char}
            </span>
          );
        }

        if (isWrong) {
          return (
            <span
              key={idx}
              style={{
                color: "var(--red-ember)",
                background: "var(--red-mute)",
                borderBottom: "1px solid var(--red)",
              }}
            >
              {char === " " ? "·" : char}
            </span>
          );
        }

        if (isTyped) {
          return (
            <span key={idx} style={{ color: "var(--text)" }}>
              {char}
            </span>
          );
        }

        return (
          <span key={idx} style={{ color: "var(--text3)" }}>
            {char}
          </span>
        );
      })}
    </span>
  );
});

interface PendingLeaderboardAttempt {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  chars: string;
  timestamp: number;
}

const INITIAL_TEXT = generateWordStream(45, "english", false, false, -1);

export default function TypingTerminal() {
  // Mode configuration
  const [mode, setMode] = useState<TestMode>("time");
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [wordLimit, setWordLimit] = useState<number>(25);
  const [vocab, setVocab] = useState<VocabType>("english");
  const [usePunctuation, setUsePunctuation] = useState(false);
  const [useNumbers, setUseNumbers] = useState(false);
  const [quoteTier, setQuoteTier] = useState<"short" | "medium" | "long">("short");
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Active test buffer & state
  const [targetText, setTargetText] = useState<string>(INITIAL_TEXT);
  const [quoteSource, setQuoteSource] = useState<string>("english · 30s timed");
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [bestWpm, setBestWpm] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const { isLoaded: authLoaded, isSignedIn, user } = useUser();
  const [topRanks, setTopRanks] = useState<LeaderboardEntry[]>([]);
  const [rankFeedback, setRankFeedback] = useState<{
    status: "idle" | "saving" | "saved" | "declined" | "error";
    userRank: number | null;
    isPersonalBest: boolean;
  }>({ status: "idle", userRank: null, isPersonalBest: false });
  const [pendingAttempt, setPendingAttempt] = useState<PendingLeaderboardAttempt | null>(null);

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const activeCursorRef = useRef<HTMLSpanElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const lastCursorTopRef = useRef<number>(0);

  const typedRef = useRef(typed);
  const targetTextRef = useRef(targetText);
  const startTimeRef = useRef(startTime);
  const totalKeystrokesRef = useRef(totalKeystrokes);
  const errorKeystrokesRef = useRef(errorKeystrokes);

  useEffect(() => {
    typedRef.current = typed;
    targetTextRef.current = targetText;
    startTimeRef.current = startTime;
    totalKeystrokesRef.current = totalKeystrokes;
    errorKeystrokesRef.current = errorKeystrokes;
  });

  const isFinished = endTime !== null;
  const isRunning = startTime !== null && endTime === null;

  // Pre-compute word tokens with start/end character indices only when targetText changes
  const wordTokens = useMemo(() => {
    const rawWords = targetText.split(" ");
    const tokens: { text: string; start: number; end: number }[] = [];
    let cursor = 0;
    for (let i = 0; i < rawWords.length; i++) {
      const piece = i < rawWords.length - 1 ? rawWords[i] + " " : rawWords[i];
      tokens.push({
        text: piece,
        start: cursor,
        end: cursor + piece.length,
      });
      cursor += piece.length;
    }
    return tokens;
  }, [targetText]);

  // Pre-buffering API fetch queue for instant 0ms responses with live randomness
  const [prefetched, setPrefetched] = useState<{
    mode: TestMode;
    quoteTier?: "short" | "medium" | "long";
    vocab?: VocabType;
    text: string;
    source: string;
  } | null>(null);

  const prefetchNext = useCallback(
    (opts?: {
      m?: TestMode;
      v?: VocabType;
      t?: number;
      w?: number;
      q?: "short" | "medium" | "long";
      p?: boolean;
      n?: boolean;
    }) => {
      const currentMode = opts?.m ?? mode;
      const currentVocab = opts?.v ?? vocab;
      const currentTier = opts?.q ?? quoteTier;
      const wordCount = currentMode === "time" ? 55 : (opts?.w ?? wordLimit);
      const useP = opts?.p ?? usePunctuation;
      const useN = opts?.n ?? useNumbers;

      const params = new URLSearchParams({
        mode: currentMode,
        vocab: currentVocab,
        tier: currentTier,
        count: String(wordCount),
      });

      fetch(`/api/sys/typing?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.type === "quote" && data?.text) {
            setPrefetched({
              mode: "quote",
              quoteTier: data.tier || currentTier,
              text: data.text,
              source: `quote · ${data.tier || currentTier} · ${data.source || "anonymous"}`,
            });
          } else if (Array.isArray(data?.words) && data.words.length > 0) {
            const formatted = formatWordsFromList(data.words, useP, useN);
            const mods = [useP ? "+punct" : "", useN ? "+nums" : ""]
              .filter(Boolean)
              .join(" ");
            const modSuffix = mods ? ` [${mods}]` : "";
            setPrefetched({
              mode: currentMode,
              vocab: currentVocab,
              text: formatted,
              source:
                currentMode === "words"
                  ? `${currentVocab} · ${opts?.w ?? wordLimit}w${modSuffix}`
                  : `${currentVocab} · ${opts?.t ?? timeLimit}s${modSuffix}`,
            });
          }
        })
        .catch(() => {});
    },
    [mode, vocab, quoteTier, wordLimit, timeLimit, usePunctuation, useNumbers],
  );

  // Build a fresh test prompt based on settings
  const buildNewTest = useCallback(
    (opts?: {
      nextMode?: TestMode;
      nextTime?: number;
      nextWords?: number;
      nextVocab?: VocabType;
      nextPunct?: boolean;
      nextNums?: boolean;
      nextQuoteTier?: "short" | "medium" | "long";
      samePrompt?: boolean;
    }) => {
      const m = opts?.nextMode ?? mode;
      const t = opts?.nextTime ?? timeLimit;
      const w = opts?.nextWords ?? wordLimit;
      const v = opts?.nextVocab ?? vocab;
      const p = opts?.nextPunct ?? usePunctuation;
      const n = opts?.nextNums ?? useNumbers;
      const qTier = opts?.nextQuoteTier ?? quoteTier;

      if (opts?.nextMode !== undefined) setMode(m);
      if (opts?.nextTime !== undefined) setTimeLimit(t);
      if (opts?.nextWords !== undefined) setWordLimit(w);
      if (opts?.nextVocab !== undefined) setVocab(v);
      if (opts?.nextPunct !== undefined) setUsePunctuation(p);
      if (opts?.nextNums !== undefined) setUseNumbers(n);
      if (opts?.nextQuoteTier !== undefined) setQuoteTier(qTier);

      if (!opts?.samePrompt) {
        const mods = [p ? "+punct" : "", n ? "+nums" : ""].filter(Boolean).join(" ");
        const modSuffix = mods ? ` [${mods}]` : "";

        // Check if prefetch buffer from API matches current mode
        let usedPrefetch = false;

        if (prefetched && prefetched.mode === m) {
          if (m === "quote" && prefetched.quoteTier === qTier) {
            setTargetText(prefetched.text);
            setQuoteSource(prefetched.source);
            usedPrefetch = true;
          } else if (m !== "quote" && prefetched.vocab === v) {
            setTargetText(prefetched.text);
            setQuoteSource(prefetched.source);
            usedPrefetch = true;
          }
        }

        if (usedPrefetch) {
          setPrefetched(null);
        } else {
          // Instant fallback using local curated generator & quotes
          if (m === "quote") {
            const tierQuotes = QUOTES.filter((q) => q.tier === qTier);
            const nextQ = (quoteIdx + 1) % tierQuotes.length;
            setQuoteIdx(nextQ);
            const chosen = tierQuotes[nextQ];
            setTargetText(chosen.text);
            setQuoteSource(`quote · ${qTier} · ${chosen.source}`);
          } else if (m === "words") {
            setTargetText(generateWordStream(w, v, p, n));
            setQuoteSource(`${v} · ${w}w${modSuffix}`);
          } else {
            setTargetText(generateWordStream(55, v, p, n));
            setQuoteSource(`${v} · ${t}s${modSuffix}`);
          }
        }

        // Replenish prefetch cache in background for next test
        prefetchNext({ m, v, t, w, q: qTier, p, n });
      }

      setTyped("");
      setStartTime(null);
      setEndTime(null);
      setNowMs(null);
      setTotalKeystrokes(0);
      setErrorKeystrokes(0);
      setStreak(0);
      setWpmHistory([]);
      setRankFeedback({ status: "idle", userRank: null, isPersonalBest: false });
      setPendingAttempt(null);
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("zaevo_pending_attempt");
        }
      } catch {}
    },
    [mode, timeLimit, wordLimit, vocab, usePunctuation, useNumbers, quoteTier, quoteIdx, prefetched, prefetchNext],
  );

  // Prefetch background prompt once on initial client mount
  useEffect(() => {
    const params = new URLSearchParams({
      mode: "time",
      vocab: "english",
      tier: "short",
      count: "55",
    });

    fetch(`/api/sys/typing?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.words) && data.words.length > 0) {
          const formatted = formatWordsFromList(data.words, false, false);
          setPrefetched({
            mode: "time",
            vocab: "english",
            text: formatted,
            source: "english · 30s",
          });
        }
      })
      .catch(() => {});
  }, []);

  // Scroll only when the active line's vertical offset actually changes
  useEffect(() => {
    const containerEl = wordsContainerRef.current;
    if (!containerEl) return;
    if (typed.length === 0) {
      containerEl.scrollTop = 0;
      lastCursorTopRef.current = 0;
      return;
    }
    const cursorEl = activeCursorRef.current;
    if (!cursorEl) return;

    const cursorTop = cursorEl.offsetTop;
    if (cursorTop === lastCursorTopRef.current) return;
    lastCursorTopRef.current = cursorTop;

    const lineHeight = 28;
    const desiredScroll = Math.max(0, cursorTop - lineHeight);
    if (Math.abs(containerEl.scrollTop - desiredScroll) > 6) {
      containerEl.scrollTop = desiredScroll;
    }
  }, [typed.length]);

  // Compute live elapsed seconds, remaining time, WPM, Raw WPM, Accuracy
  const rawElapsedSec =
    startTime !== null
      ? Math.max(0.1, ((endTime ?? nowMs ?? startTime) - startTime) / 1000)
      : 0;

  const elapsedSec =
    mode === "time" ? Math.min(timeLimit, rawElapsedSec) : rawElapsedSec;

  const remainingSec =
    mode === "time"
      ? Math.max(0, timeLimit - (startTime !== null ? rawElapsedSec : 0))
      : 0;

  const correctChars = useMemo(() => {
    let ok = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === targetText[i]) ok++;
    }
    return ok;
  }, [typed, targetText]);

  const netWpm =
    elapsedSec >= 0.4 ? Math.round(correctChars / 5 / (elapsedSec / 60)) : 0;
  const rawWpm =
    elapsedSec >= 0.4 ? Math.round(typed.length / 5 / (elapsedSec / 60)) : 0;
  const accuracy =
    totalKeystrokes > 0
      ? Math.max(
          0,
          Math.round(
            ((totalKeystrokes - errorKeystrokes) / totalKeystrokes) * 100,
          ),
        )
      : 100;

  const consistency = useMemo(() => {
    if (wpmHistory.length < 2) return 100;
    const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
    if (mean <= 0) return 100;
    const variance =
      wpmHistory.reduce((acc, val) => acc + (val - mean) ** 2, 0) /
      wpmHistory.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, Math.min(100, Math.round(100 - (stdDev / mean) * 100)));
  }, [wpmHistory]);

  const nextChar =
    typed.length < targetText.length ? targetText[typed.length] : undefined;
  const nextKeyCode = charToKeyCode(nextChar);

  // Sync target next key to ~/KEYBOARD only when nextKeyCode changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("ttype-state", {
        detail: {
          nextCode: nextKeyCode,
          active: startTime !== null,
        },
      }),
    );
  }, [nextKeyCode, startTime]);

  // Callback to submit attempt score to leaderboard
  const submitAttemptToLeaderboard = useCallback(
    (attemptData?: PendingLeaderboardAttempt) => {
      const payload = attemptData ?? {
        wpm: netWpm,
        rawWpm,
        accuracy,
        consistency,
        mode: quoteSource,
        chars: `${correctChars}/${errorKeystrokes}`,
        timestamp: Date.now(),
      };

      if (payload.wpm <= 0) return;

      setRankFeedback((prev) => ({ ...prev, status: "saving" }));

      fetch("/api/usr/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wpm: payload.wpm,
          rawWpm: payload.rawWpm,
          accuracy: payload.accuracy,
          consistency: payload.consistency,
          mode: payload.mode,
          chars: payload.chars,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.entries)) {
            setTopRanks(data.entries.slice(0, 3));
          }
          if (typeof data?.bestWpm === "number") {
            setBestWpm((prev) => Math.max(prev, data.bestWpm));
          }
          setRankFeedback({
            status: "saved",
            userRank: data?.userRank ?? null,
            isPersonalBest: Boolean(data?.isPersonalBest),
          });
          if (typeof window !== "undefined") {
            try {
              window.sessionStorage.removeItem("zaevo_pending_attempt");
            } catch {}
            window.dispatchEvent(new CustomEvent("leaderboard-updated"));
          }
          setPendingAttempt(null);
        })
        .catch(() => {
          setRankFeedback({
            status: "error",
            userRank: null,
            isPersonalBest: false,
          });
        });
    },
    [netWpm, rawWpm, accuracy, consistency, quoteSource, correctChars, errorKeystrokes],
  );

  // Fetch top leaderboard ranks on test completion (without auto-submitting)
  useEffect(() => {
    if (!isFinished || endTime === null) return;

    fetch("/api/usr/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.entries)) {
          setTopRanks(data.entries.slice(0, 3));
        }
      })
      .catch(() => {});
  }, [isFinished, endTime]);

  // If user signed in after choosing to submit an attempt, automatically post it
  useEffect(() => {
    if (!authLoaded || !isSignedIn || !user) return;

    let toSubmit = pendingAttempt;
    if (!toSubmit && typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem("zaevo_pending_attempt");
        if (stored) {
          const parsed = JSON.parse(stored) as PendingLeaderboardAttempt;
          if (Date.now() - (parsed.timestamp || 0) < 15 * 60 * 1000) {
            toSubmit = parsed;
          } else {
            window.sessionStorage.removeItem("zaevo_pending_attempt");
          }
        }
      } catch {}
    }

    if (
      toSubmit &&
      toSubmit.wpm > 0 &&
      rankFeedback.status !== "saved" &&
      rankFeedback.status !== "saving"
    ) {
      const timer = setTimeout(() => {
        submitAttemptToLeaderboard(toSubmit);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [
    authLoaded,
    isSignedIn,
    user,
    pendingAttempt,
    rankFeedback.status,
    submitAttemptToLeaderboard,
  ]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("ttype-state", {
            detail: { nextCode: null, lastKey: null, active: false },
          }),
        );
      }
    };
  }, []);

  // Lightweight 500ms timer & 1-second WPM sampler while running
  useEffect(() => {
    if (!isRunning || startTime === null) return;

    const tick = setInterval(() => {
      const now = Date.now();
      setNowMs(now);

      if (mode === "time" && (now - startTime) / 1000 >= timeLimit) {
        setEndTime(startTime + timeLimit * 1000);
        const curTyped = typedRef.current;
        const curTarget = targetTextRef.current;
        let ok = 0;
        for (let i = 0; i < curTyped.length; i++) {
          if (curTyped[i] === curTarget[i]) ok++;
        }
        const finalWpm = Math.round(ok / 5 / (timeLimit / 60));
        setWpmHistory((prev) => [...prev.slice(-29), finalWpm]);
        setBestWpm((prev) => Math.max(prev, finalWpm));
      }
    }, 500);

    const sample = setInterval(() => {
      const st = startTimeRef.current;
      if (!st) return;
      const sec = Math.max(0.5, (Date.now() - st) / 1000);
      const curTyped = typedRef.current;
      const curTarget = targetTextRef.current;
      let ok = 0;
      for (let i = 0; i < curTyped.length; i++) {
        if (curTyped[i] === curTarget[i]) ok++;
      }
      const snapWpm = Math.round(ok / 5 / (sec / 60));
      const totKeys = totalKeystrokesRef.current;
      const errKeys = errorKeystrokesRef.current;
      const snapAcc =
        totKeys > 0
          ? Math.max(0, Math.round(((totKeys - errKeys) / totKeys) * 100))
          : 100;

      setWpmHistory((prev) => [...prev.slice(-29), snapWpm]);

      window.dispatchEvent(
        new CustomEvent("ttype-state", {
          detail: {
            wpm: snapWpm,
            acc: snapAcc,
            active: true,
          },
        }),
      );
    }, 1000);

    return () => {
      clearInterval(tick);
      clearInterval(sample);
    };
  }, [isRunning, startTime, mode, timeLimit]);

  const handleCharacterInput = useCallback(
    (char: string) => {
      if (endTime !== null) return;
      const curTyped = typedRef.current;
      const curTarget = targetTextRef.current;
      if (curTyped.length >= curTarget.length) return;

      const now = Date.now();
      const effectiveStart = startTimeRef.current ?? now;
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
        setStartTime(now);
        setNowMs(now);
      }

      const expectedChar = curTarget[curTyped.length];
      const isCorrect = char === expectedChar;
      const nextTyped = curTyped + char;
      typedRef.current = nextTyped;

      setTyped(nextTyped);
      setTotalKeystrokes((prev) => prev + 1);
      if (!isCorrect) {
        setErrorKeystrokes((prev) => prev + 1);
        setStreak(0);
        const code = charToKeyCode(char);
        if (code && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ttype-state", {
              detail: {
                pulseCode: code,
                isError: true,
                lastKey: char === " " ? "SPC" : char,
              },
            }),
          );
        }
      } else {
        setStreak((prev) => prev + 1);
      }

      // In time mode, append more words when getting within 100 chars of the end
      if (mode === "time" && curTarget.length - nextTyped.length < 100) {
        const moreWords = generateWordStream(
          35,
          vocab,
          usePunctuation,
          useNumbers,
        );
        setTargetText((prev) => `${prev} ${moreWords}`);
        return;
      }

      // Check completion for words/quote modes
      if (nextTyped.length === curTarget.length) {
        setEndTime(now);
        setNowMs(now);
        const totalSec = Math.max(0.5, (now - effectiveStart) / 1000);
        let finalOk = 0;
        for (let i = 0; i < nextTyped.length; i++) {
          if (nextTyped[i] === curTarget[i]) finalOk++;
        }
        const finalWpm = Math.round(finalOk / 5 / (totalSec / 60));
        setWpmHistory((prev) => [...prev.slice(-29), finalWpm]);
        setBestWpm((prev) => Math.max(prev, finalWpm));
      }
    },
    [endTime, mode, vocab, usePunctuation, useNumbers],
  );

  const handleBackspace = useCallback(
    (ctrlKey: boolean) => {
      if (endTime !== null) return;
      const curTyped = typedRef.current;
      if (curTyped.length === 0) return;

      let nextTyped: string;
      if (ctrlKey) {
        const trimmed = curTyped.trimEnd();
        const lastSpace = trimmed.lastIndexOf(" ");
        nextTyped = lastSpace === -1 ? "" : curTyped.slice(0, lastSpace + 1);
      } else {
        nextTyped = curTyped.slice(0, -1);
      }
      typedRef.current = nextTyped;
      setTyped(nextTyped);
    },
    [endTime],
  );

  // Stable ref for keydown handler so listener is attached only ONCE on mount
  const keyDownHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyDownHandlerRef.current = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isOtherInput =
        activeEl &&
        activeEl !== hiddenInputRef.current &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable);

      if (isOtherInput) return;

      if (e.key === "Tab") {
        e.preventDefault();
        buildNewTest();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        buildNewTest({ samePrompt: true });
        return;
      }

      if (e.key === "Enter" && endTime !== null) {
        e.preventDefault();
        buildNewTest();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) {
        if (e.key === "Backspace" && (e.ctrlKey || e.altKey)) {
          e.preventDefault();
          handleBackspace(true);
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace(false);
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        handleCharacterInput(e.key);
      }
    };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keyDownHandlerRef.current(e);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Word progress count
  const wordsTypedCount = useMemo(() => {
    if (typed.length === 0) return 0;
    let spaces = 0;
    for (let i = 0; i < typed.length; i++) {
      if (targetText[i] === " ") spaces++;
    }
    return spaces;
  }, [typed, targetText]);

  const totalWordsCount = wordTokens.length;

  const progressPct =
    mode === "time"
      ? startTime !== null
        ? Math.min(100, Math.round((elapsedSec / timeLimit) * 100))
        : 0
      : Math.min(100, Math.round((typed.length / targetText.length) * 100));

  const maxHistWpm = Math.max(60, ...wpmHistory, netWpm);

  return (
    <div
      className="flex flex-col h-full justify-between select-none"
      style={{ fontFamily: "var(--mono)" }}
      onClick={() => {
        setIsFocused(true);
        if (
          typeof window !== "undefined" &&
          window.matchMedia("(pointer: coarse)").matches
        ) {
          hiddenInputRef.current?.focus();
        }
      }}
    >
      {/* Hidden input only focused on touch/coarse-pointer devices */}
      <input
        ref={hiddenInputRef}
        type="text"
        value=""
        aria-label="Terminal typing test input"
        onFocus={() => setIsFocused(true)}
        onChange={(e) => {
          const val = e.target.value;
          if (val.length > 0) {
            handleCharacterInput(val[val.length - 1]);
          }
        }}
        className="sr-only"
      />

      {/* ── Top Section: Monkeytype Config Bar & Live Telemetry ───────── */}
      <div className="flex flex-col gap-[8px]">
        {/* Monkeytype-style Top Pill Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-[6px] px-[10px] py-[6px] border"
          style={{
            background: "var(--bg2)",
            borderColor: "var(--border)",
          }}
        >
          {/* Left: Modifiers (@punctuation, #numbers, dictionary) */}
          <div className="flex items-center gap-[4px] flex-wrap">
            {mode !== "quote" && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    buildNewTest({ nextPunct: !usePunctuation });
                  }}
                  className="px-[7px] py-[2px] text-[10px] border cursor-pointer transition-colors"
                  style={{
                    color: usePunctuation ? "var(--amber)" : "var(--text3)",
                    background: usePunctuation ? "var(--bg3)" : "transparent",
                    borderColor: usePunctuation
                      ? "var(--amber-dim)"
                      : "var(--border)",
                  }}
                >
                  @ punctuation
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    buildNewTest({ nextNums: !useNumbers });
                  }}
                  className="px-[7px] py-[2px] text-[10px] border cursor-pointer transition-colors"
                  style={{
                    color: useNumbers ? "var(--amber)" : "var(--text3)",
                    background: useNumbers ? "var(--bg3)" : "transparent",
                    borderColor: useNumbers
                      ? "var(--amber-dim)"
                      : "var(--border)",
                  }}
                >
                  # numbers
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    buildNewTest({
                      nextVocab: vocab === "english" ? "unix" : "english",
                    });
                  }}
                  className="px-[7px] py-[2px] text-[10px] border cursor-pointer transition-colors"
                  style={{
                    color: vocab === "unix" ? "var(--green)" : "var(--text2)",
                    background: "var(--bg1)",
                    borderColor: "var(--border2)",
                  }}
                  title="Switch dictionary between English 200 and Unix/Systems vocabulary"
                >
                  $ {vocab}
                </button>
                <span
                  className="mx-[2px] text-[10px]"
                  style={{ color: "var(--border2)" }}
                >
                  │
                </span>
              </>
            )}

            {/* Center: Mode selector (time | words | quote) */}
            {(["time", "words", "quote"] as TestMode[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    buildNewTest({ nextMode: m });
                  }}
                  className="px-[8px] py-[2px] text-[10px] uppercase tracking-[0.8px] border cursor-pointer transition-colors"
                  style={{
                    color: active ? "var(--red)" : "var(--text3)",
                    background: active ? "var(--red-mute)" : "transparent",
                    borderColor: active ? "var(--red-dim)" : "var(--border)",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Right: Sub-options (15/30/60s or 10/25/50w or short/medium/long) + New/Reset */}
          <div className="flex items-center gap-[4px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-[4px]"
              >
                {mode === "time" &&
                  [15, 30, 60].map((sec) => {
                    const active = timeLimit === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          buildNewTest({ nextTime: sec });
                        }}
                        className="px-[6px] py-[2px] text-[10px] border cursor-pointer transition-colors"
                        style={{
                          color: active ? "var(--red-ember)" : "var(--text3)",
                          background: active ? "var(--red-mute)" : "var(--bg1)",
                          borderColor: active ? "var(--red-dim)" : "var(--border)",
                        }}
                      >
                        {sec}s
                      </button>
                    );
                  })}

                {mode === "words" &&
                  [10, 25, 50].map((cnt) => {
                    const active = wordLimit === cnt;
                    return (
                      <button
                        key={cnt}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          buildNewTest({ nextWords: cnt });
                        }}
                        className="px-[6px] py-[2px] text-[10px] border cursor-pointer transition-colors"
                        style={{
                          color: active ? "var(--red-ember)" : "var(--text3)",
                          background: active ? "var(--red-mute)" : "var(--bg1)",
                          borderColor: active ? "var(--red-dim)" : "var(--border)",
                        }}
                      >
                        {cnt}w
                      </button>
                    );
                  })}

                {mode === "quote" &&
                  (["short", "medium", "long"] as const).map((tier) => {
                    const active = quoteTier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          buildNewTest({ nextQuoteTier: tier });
                        }}
                        className="px-[6px] py-[2px] text-[10px] border cursor-pointer transition-colors"
                        style={{
                          color: active ? "var(--red-ember)" : "var(--text3)",
                          background: active ? "var(--red-mute)" : "var(--bg1)",
                          borderColor: active ? "var(--red-dim)" : "var(--border)",
                        }}
                      >
                        {tier}
                      </button>
                    );
                  })}
              </motion.div>
            </AnimatePresence>

            <span
              className="mx-[2px] text-[10px]"
              style={{ color: "var(--border2)" }}
            >
              │
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                buildNewTest();
              }}
              className="flex items-center gap-[4px] px-[7px] py-[2px] text-[10px] border cursor-pointer transition-colors hover:border-[var(--red-dim)] hover:text-[var(--text)]"
              style={{
                color: "var(--text2)",
                borderColor: "var(--border2)",
                background: "var(--bg1)",
              }}
              title="New randomized test (Tab)"
            >
              <Shuffle size={10} />
              <span>tab</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                buildNewTest({ samePrompt: true });
              }}
              className="flex items-center gap-[4px] px-[7px] py-[2px] text-[10px] border cursor-pointer transition-colors hover:border-[var(--red-dim)] hover:text-[var(--text)]"
              style={{
                color: "var(--text2)",
                borderColor: "var(--border2)",
                background: "var(--bg1)",
              }}
              title="Repeat current words (Esc)"
            >
              <RotateCcw size={10} />
              <span>esc</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Strip */}
        <div className="grid grid-cols-4 gap-[6px]">
          <div
            className="px-[10px] py-[6px] border flex flex-col"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <span
              className="text-[9px] uppercase tracking-[1px]"
              style={{ color: "var(--text3)" }}
            >
              {mode === "time" ? "timer" : "words"}
            </span>
            <div className="flex items-baseline gap-[6px]">
              <span
                className="text-[15px] font-bold"
                style={{ color: "var(--amber)" }}
              >
                {mode === "time"
                  ? `${Math.ceil(remainingSec)}s`
                  : `${wordsTypedCount}/${totalWordsCount}`}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text3)" }}>
                {progressPct}%
              </span>
            </div>
          </div>

          <div
            className="px-[10px] py-[6px] border flex flex-col"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <span
              className="text-[9px] uppercase tracking-[1px]"
              style={{ color: "var(--text3)" }}
            >
              wpm
            </span>
            <div className="flex items-baseline gap-[6px]">
              <span
                className="text-[15px] font-bold"
                style={{ color: "var(--red-ember)" }}
              >
                {netWpm}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text3)" }}>
                raw {rawWpm}
              </span>
            </div>
          </div>

          <div
            className="px-[10px] py-[6px] border flex flex-col"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <span
              className="text-[9px] uppercase tracking-[1px]"
              style={{ color: "var(--text3)" }}
            >
              accuracy
            </span>
            <div className="flex items-baseline gap-[6px]">
              <span
                className="text-[15px] font-bold"
                style={{
                  color:
                    accuracy >= 96
                      ? "var(--green)"
                      : accuracy >= 88
                        ? "var(--amber)"
                        : "var(--red)",
                }}
              >
                {accuracy}%
              </span>
              <span className="text-[10px]" style={{ color: "var(--text3)" }}>
                err {errorKeystrokes}
              </span>
            </div>
          </div>

          <div
            className="px-[10px] py-[6px] border flex flex-col"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <span
              className="text-[9px] uppercase tracking-[1px]"
              style={{ color: "var(--text3)" }}
            >
              streak / pb
            </span>
            <div className="flex items-baseline gap-[6px]">
              <span
                className="text-[15px] font-bold"
                style={{ color: "var(--text)" }}
              >
                {streak}x
              </span>
              <span className="text-[10px]" style={{ color: "var(--text3)" }}>
                pb {Math.max(bestWpm, netWpm)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Section: Scrolling Word Stream or Post-Test Report ─── */}
      <div
        className="my-[8px] flex-1 flex flex-col justify-between border relative overflow-hidden p-[14px]"
        style={{
          background: "var(--bg)",
          borderColor: isRunning ? "var(--red-dim)" : "var(--border)",
        }}
      >
        {/* Top 2px progress bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full transition-all duration-150 ease-out"
            style={{
              width: `${progressPct}%`,
              background: "var(--red-ember)",
            }}
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!isFinished ? (
            <motion.div
              key="typing-arena"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col justify-between min-h-0"
            >
              {/* Multi-line auto-scrolling word viewport with smooth crossfade on prompt change */}
              <div
                ref={wordsContainerRef}
                className="relative overflow-hidden max-h-[112px] my-auto pr-[4px]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={targetText.slice(0, 32)}
                    initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[15px] leading-[28px] tracking-[0.4px] break-words"
                  >
                    {wordTokens.map((token) => {
                      const isFullyUntyped = typed.length < token.start;
                      const hasCursor =
                        typed.length >= token.start && typed.length < token.end;
                      const cursorOffset = hasCursor
                        ? typed.length - token.start
                        : -1;
                      const typedSlice = isFullyUntyped
                        ? ""
                        : typed.slice(token.start, token.end);

                      return (
                        <WordToken
                          key={token.start}
                          wordWithSpace={token.text}
                          startIndex={token.start}
                          typedSlice={typedSlice}
                          cursorOffset={cursorOffset}
                          isFullyUntyped={isFullyUntyped}
                          cursorRef={hasCursor ? activeCursorRef : undefined}
                        />
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Arena Footer */}
              <div
                className="flex items-center justify-between pt-[8px] border-t text-[10px]"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="flex items-center gap-[8px]"
                  style={{ color: "var(--text3)" }}
                >
                  <Terminal size={11} style={{ color: "var(--red)" }} />
                  <span>
                    next:{" "}
                    <b
                      className="px-[5px] py-[1px] border"
                      style={{
                        color: "var(--amber)",
                        borderColor: "var(--border2)",
                        background: "var(--bg2)",
                      }}
                    >
                      {formatKeyLabel(nextChar)}
                    </b>
                  </span>
                  <span>·</span>
                  <span>{quoteSource}</span>
                </div>
                <span style={{ color: "var(--text3)" }}>
                  {isRunning
                    ? "streaming to ~/KEYBOARD"
                    : isFocused
                      ? "start typing anywhere..."
                      : "click to focus"}
                </span>
              </div>
            </motion.div>
          ) : (
            /* ── Monkeytype Result Summary View ── */
            <motion.div
              key="results-summary"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-[10px] my-auto"
            >
              <div
                className="flex items-center justify-between border-b pb-[8px]"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-[8px]">
                  <CheckCircle2 size={14} style={{ color: "var(--green)" }} />
                  <span
                    className="text-[12px] font-bold uppercase tracking-[1px]"
                    style={{ color: "var(--text)" }}
                  >
                    TEST COMPLETE // {quoteSource}
                  </span>
                </div>
                <span
                  className="text-[10px] px-[8px] py-[2px] border"
                  style={{
                    color: "var(--green)",
                    borderColor: "var(--green-dim)",
                    background: "var(--bg2)",
                  }}
                >
                  PB: {Math.max(bestWpm, netWpm)} WPM
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-[8px]">
                <div>
                  <div
                    className="text-[9px] uppercase"
                    style={{ color: "var(--text3)" }}
                  >
                    wpm
                  </div>
                  <div
                    className="text-[20px] font-bold tabular-nums"
                    style={{ color: "var(--red-ember)" }}
                  >
                    {netWpm}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[9px] uppercase"
                    style={{ color: "var(--text3)" }}
                  >
                    acc
                  </div>
                  <div
                    className="text-[20px] font-bold tabular-nums"
                    style={{ color: "var(--green)" }}
                  >
                    {accuracy}%
                  </div>
                </div>
                <div>
                  <div
                    className="text-[9px] uppercase"
                    style={{ color: "var(--text3)" }}
                  >
                    raw
                  </div>
                  <div
                    className="text-[20px] font-bold tabular-nums"
                    style={{ color: "var(--amber)" }}
                  >
                    {rawWpm}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[9px] uppercase"
                    style={{ color: "var(--text3)" }}
                  >
                    consistency
                  </div>
                  <div
                    className="text-[20px] font-bold tabular-nums"
                    style={{ color: "var(--text)" }}
                  >
                    {consistency}%
                  </div>
                </div>
                <div>
                  <div
                    className="text-[9px] uppercase"
                    style={{ color: "var(--text3)" }}
                  >
                    chars (ok/err)
                  </div>
                  <div
                    className="text-[15px] font-bold pt-[3px] tabular-nums"
                    style={{ color: "var(--text2)" }}
                  >
                    {correctChars}/{errorKeystrokes}
                  </div>
                </div>
              </div>

              {/* Interactive Leaderboard Submission Action Row */}
              <div
                className="px-[10px] py-[8px] border flex flex-col gap-[8px]"
                style={{
                  background: "var(--bg2)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center justify-between gap-[8px] flex-wrap">
                  <div className="flex items-center gap-[6px]">
                    <Trophy size={12} style={{ color: "var(--amber)" }} />
                    <span
                      className="text-[10px] uppercase tracking-[0.8px] font-bold"
                      style={{ color: "var(--text2)" }}
                    >
                      leaderboard
                    </span>
                  </div>

                  {/* Dynamic Submission Options / Status Feedback */}
                  <AnimatePresence mode="wait">
                    {rankFeedback.status === "saved" && rankFeedback.userRank ? (
                      <motion.div
                        key="saved-status"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-[6px] text-[10px]"
                        style={{ color: "var(--green)" }}
                      >
                        <CheckCircle2 size={12} />
                        <span>ranked #{String(rankFeedback.userRank).padStart(2, "0")}</span>
                        {rankFeedback.isPersonalBest && (
                          <span
                            className="px-[5px] py-[1px] text-[9px] font-bold uppercase tracking-[0.5px]"
                            style={{ background: "var(--red)", color: "var(--bg)" }}
                          >
                            NEW PERSONAL BEST!
                          </span>
                        )}
                        <span style={{ color: "var(--text3)" }}>· synced to leaderboard</span>
                      </motion.div>
                    ) : rankFeedback.status === "saving" ? (
                      <motion.div
                        key="saving-status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] animate-pulse"
                        style={{ color: "var(--amber)" }}
                      >
                        syncing attempt to leaderboard…
                      </motion.div>
                    ) : rankFeedback.status === "declined" ? (
                      <motion.div
                        key="declined-status"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-[8px] text-[10px]"
                      >
                        <span style={{ color: "var(--text3)" }}>
                          attempt kept private (not submitted to leaderboard)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSignedIn && user) {
                              submitAttemptToLeaderboard();
                            } else {
                              const attempt: PendingLeaderboardAttempt = {
                                wpm: netWpm,
                                rawWpm,
                                accuracy,
                                consistency,
                                mode: quoteSource,
                                chars: `${correctChars}/${errorKeystrokes}`,
                                timestamp: Date.now(),
                              };
                              setPendingAttempt(attempt);
                              try {
                                window.sessionStorage.setItem(
                                  "zaevo_pending_attempt",
                                  JSON.stringify(attempt),
                                );
                              } catch {}
                            }
                          }}
                          className="px-[6px] py-[1px] text-[9px] border cursor-pointer hover:border-[var(--red)] hover:text-[var(--red-ember)] transition-colors"
                          style={{
                            background: "var(--bg1)",
                            borderColor: "var(--border2)",
                            color: "var(--text2)",
                          }}
                        >
                          submit anyway
                        </button>
                      </motion.div>
                    ) : rankFeedback.status === "error" ? (
                      <motion.div
                        key="error-status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-[6px] text-[10px]"
                      >
                        <span style={{ color: "var(--red-ember)" }}>
                          failed to sync attempt
                        </span>
                        <button
                          type="button"
                          onClick={() => submitAttemptToLeaderboard()}
                          className="px-[6px] py-[1px] text-[9px] uppercase border cursor-pointer hover:border-[var(--red)]"
                          style={{
                            background: "var(--bg1)",
                            borderColor: "var(--border2)",
                            color: "var(--text)",
                          }}
                        >
                          retry
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="prompt-status"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-[6px] flex-wrap"
                      >
                        <span className="text-[10px]" style={{ color: "var(--text3)" }}>
                          submit attempt to leaderboard?
                        </span>

                        {isSignedIn && user ? (
                          <button
                            type="button"
                            onClick={() => submitAttemptToLeaderboard()}
                            className="px-[8px] py-[2px] text-[10px] border cursor-pointer font-bold transition-all hover:bg-[var(--red)] hover:text-[var(--bg)]"
                            style={{
                              background: "var(--red-mute)",
                              borderColor: "var(--red)",
                              color: "var(--red)",
                            }}
                          >
                            [✓ submit as @{user.username || user.firstName || "operator"}]
                          </button>
                        ) : (
                          <SignInButton mode="modal" fallbackRedirectUrl="/term">
                            <button
                              type="button"
                              onClick={() => {
                                const attempt: PendingLeaderboardAttempt = {
                                  wpm: netWpm,
                                  rawWpm,
                                  accuracy,
                                  consistency,
                                  mode: quoteSource,
                                  chars: `${correctChars}/${errorKeystrokes}`,
                                  timestamp: Date.now(),
                                };
                                setPendingAttempt(attempt);
                                try {
                                  window.sessionStorage.setItem(
                                    "zaevo_pending_attempt",
                                    JSON.stringify(attempt),
                                  );
                                } catch {}
                              }}
                              className="px-[8px] py-[2px] text-[10px] border cursor-pointer font-bold transition-all hover:bg-[var(--red)] hover:text-[var(--bg)]"
                              style={{
                                background: "var(--red-mute)",
                                borderColor: "var(--red)",
                                color: "var(--red)",
                              }}
                            >
                              [sign in to submit attempt →]
                            </button>
                          </SignInButton>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setRankFeedback((prev) => ({ ...prev, status: "declined" }));
                            setPendingAttempt(null);
                            try {
                              window.sessionStorage.removeItem("zaevo_pending_attempt");
                            } catch {}
                          }}
                          className="px-[7px] py-[2px] text-[10px] border cursor-pointer transition-colors hover:text-[var(--text)] hover:border-[var(--red-dim)]"
                          style={{
                            background: "var(--bg1)",
                            borderColor: "var(--border2)",
                            color: "var(--text3)",
                          }}
                        >
                          [keep private]
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {topRanks.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-[6px] pt-[2px]">
                    {topRanks.map((entry) => (
                      <div
                        key={entry.id}
                        className="px-[8px] py-[4px] border flex items-center justify-between text-[10px]"
                        style={{
                          background: "var(--bg1)",
                          borderColor:
                            user && entry.userId === user.id
                              ? "var(--red-dim)"
                              : "var(--border)",
                        }}
                      >
                        <span className="truncate pr-[6px]" style={{ color: "var(--text2)" }}>
                          <b
                            style={{
                              color:
                                entry.rank === 1
                                  ? "var(--red-ember)"
                                  : entry.rank === 2
                                    ? "var(--amber)"
                                    : "var(--green)",
                            }}
                          >
                            #{String(entry.rank).padStart(2, "0")}
                          </b>{" "}
                          @{entry.username}
                        </span>
                        <b className="shrink-0" style={{ color: "var(--text)" }}>
                          {entry.wpm} wpm
                        </b>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-[8px] pt-[2px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    buildNewTest();
                  }}
                  className="px-[12px] py-[5px] text-[10px] uppercase tracking-[1px] font-bold border cursor-pointer transition-all duration-150 hover:bg-[var(--red)] hover:text-[var(--bg)]"
                  style={{
                    background: "var(--red-mute)",
                    borderColor: "var(--red)",
                    color: "var(--red)",
                  }}
                >
                  [tab / enter] new test →
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    buildNewTest({ samePrompt: true });
                  }}
                  className="px-[12px] py-[5px] text-[10px] uppercase tracking-[1px] border cursor-pointer transition-all duration-150 hover:text-[var(--text)] hover:border-[var(--red-dim)]"
                  style={{
                    background: "var(--bg2)",
                    borderColor: "var(--border2)",
                    color: "var(--text2)",
                  }}
                >
                  [esc] repeat words
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Section: Live WPM Telemetry Graph & Statusline ─────── */}
      <AnimatePresence>
        {startTime !== null && (
          <motion.div
            key="tty-telemetry-bottom"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden flex flex-col gap-[6px] shrink-0"
          >
            <div
              className="px-[10px] py-[5px] border flex items-center justify-between gap-[12px]"
              style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-[6px] shrink-0">
                <Zap size={11} style={{ color: "var(--amber)" }} />
                <span
                  className="text-[9px] uppercase tracking-[1px]"
                  style={{ color: "var(--text3)" }}
                >
                  wpm graph ({consistency}% consistency)
                </span>
              </div>

              <div className="flex items-end gap-[2px] h-[16px] flex-1 max-w-[280px] justify-end">
                {(wpmHistory.length > 0
                  ? wpmHistory
                  : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ).map((val, i) => {
                  const hPct =
                    val > 0
                      ? Math.max(20, Math.round((val / maxHistWpm) * 100))
                      : 15;
                  return (
                    <div
                      key={i}
                      className="w-[5px] transition-all duration-150"
                      style={{
                        height: `${hPct}%`,
                        background: val > 0 ? "var(--red)" : "var(--border2)",
                      }}
                      title={`${val} WPM`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Status Bar */}
            <div
              className="flex items-center justify-between text-[10px] border"
              style={{
                background: "var(--bg1)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center">
                <span
                  className="px-[8px] py-[2px] font-bold uppercase tracking-[1px]"
                  style={{
                    background: isRunning
                      ? "var(--red)"
                      : isFinished
                        ? "var(--green)"
                        : "var(--red-mute)",
                    color: isRunning || isFinished ? "var(--bg)" : "var(--red)",
                  }}
                >
                  {isRunning ? "TYPING" : isFinished ? "RESULTS" : "IDLE"}
                </span>
                <span
                  className="px-[8px] py-[2px]"
                  style={{ color: "var(--text2)", background: "var(--bg2)" }}
                >
                  {mode === "time"
                    ? `${timeLimit}s`
                    : mode === "words"
                      ? `${wordLimit}w`
                      : "quote"}{" "}
                  · {vocab}
                </span>
              </div>

              <div
                className="flex items-center gap-[10px] px-[8px]"
                style={{ color: "var(--text3)" }}
              >
                <span className="hidden sm:inline">ctrl+bksp: del word</span>
                <span>·</span>
                <span style={{ color: "var(--text2)" }}>
                  [tab] new · [esc] retry
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
