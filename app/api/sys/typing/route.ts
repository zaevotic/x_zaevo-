import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface TypingContentResponse {
  type: "quote" | "words";
  text?: string;
  source?: string;
  tier?: "short" | "medium" | "long";
  words?: string[];
  origin: "api" | "fallback";
}

// ── Rich Curated Technical & Engineering Fallback Bank ─────────────────────────

const FALLBACK_QUOTES = [
  // Short (< 125 chars)
  {
    source: "Ken Thompson // Bell Labs",
    text: "one of my most productive days was throwing away one thousand lines of code. when in doubt, use brute force.",
    tier: "short" as const,
  },
  {
    source: "zaevo // OMEN-erde",
    text: "abstractions must earn their keep or they get deleted. taste is the forcing function for getting every low level detail right.",
    tier: "short" as const,
  },
  {
    source: "Alan Kay // Xerox PARC",
    text: "simple things should be simple, complex things should be possible. the best way to predict the future is to invent it.",
    tier: "short" as const,
  },
  {
    source: "Dennis Ritchie // Bell Labs",
    text: "unix is simple. it just takes a genius to understand its simplicity. a language that does not affect how you think is not worth knowing.",
    tier: "short" as const,
  },
  {
    source: "Donald Knuth // Stanford",
    text: "premature optimization is the root of all evil. we should forget about small efficiencies, say about ninety seven percent of the time.",
    tier: "short" as const,
  },
  {
    source: "Edsger Dijkstra // Austin",
    text: "simplicity is prerequisite for reliability. elegance is not a dispensable luxury, but a quality that decides between success and failure.",
    tier: "short" as const,
  },

  // Medium (125 - 165 chars)
  {
    source: "Linus Torvalds // LKML",
    text: "talk is cheap. show me the code. bad programmers worry about the code. good programmers worry about data structures and their relationships.",
    tier: "medium" as const,
  },
  {
    source: "Richard Feynman // Caltech",
    text: "what i cannot create, i do not understand. study hard what interests you the most in the most undisciplined, irreverent and original manner possible.",
    tier: "medium" as const,
  },
  {
    source: "John Carmack // id Software",
    text: "focused hard work is the real key to success. keep your eyes on the goal, and just keep taking the next step towards completing it.",
    tier: "medium" as const,
  },
  {
    source: "Rob Pike // Go Team",
    text: "data dominates. if you have chosen the right data structures and organized things well, the algorithms will almost always be self evident.",
    tier: "medium" as const,
  },
  {
    source: "Leslie Lamport // Microsoft Research",
    text: "a distributed system is one in which the failure of a computer you did not even know existed can render your own computer unusable.",
    tier: "medium" as const,
  },
  {
    source: "Bjarne Stroustrup // Bell Labs",
    text: "there are only two kinds of languages: the ones people complain about and the ones nobody uses. design and programming are human activities.",
    tier: "medium" as const,
  },

  // Long (> 165 chars)
  {
    source: "Unix Philosophy // Doug McIlroy",
    text: "write programs that do one thing and do it well. write programs to work together. write programs to handle text streams, because that is a universal interface.",
    tier: "long" as const,
  },
  {
    source: "Brian Kernighan // C Programming",
    text: "debugging is twice as hard as writing the code in the first place. therefore, if you write the code as cleverly as possible, you are by definition not smart enough to debug it.",
    tier: "long" as const,
  },
  {
    source: "Grace Hopper // US Navy",
    text: "the most dangerous phrase in the language is we have always done it this way. humans are allergic to change. they love to say we tried that four years ago and it did not work.",
    tier: "long" as const,
  },
  {
    source: "Linus Torvalds // Open Source",
    text: "most good programmers do programming not because they expect to get paid or get adulation by the public, but because it is fun to program. intelligence is the ability to avoid doing work.",
    tier: "long" as const,
  },
];

const EXTENDED_ENGLISH = [
  "about", "above", "across", "action", "activity", "actually", "address", "admit", "affect", "after",
  "again", "against", "agency", "agent", "agree", "ahead", "allow", "almost", "alone", "along",
  "already", "also", "always", "among", "amount", "analysis", "animal", "another", "answer", "anyone",
  "appear", "apply", "approach", "argue", "around", "arrive", "article", "assume", "attack", "author",
  "authority", "avoid", "beautiful", "become", "before", "begin", "behavior", "behind", "believe", "benefit",
  "better", "between", "beyond", "billion", "board", "bottom", "budget", "build", "business", "camera",
  "campaign", "cancer", "capital", "career", "carry", "catch", "cause", "center", "central", "century",
  "certain", "certainly", "chair", "challenge", "chance", "change", "character", "charge", "check", "choice",
  "choose", "church", "citizen", "claim", "clearly", "close", "coach", "collection", "college", "color",
  "commercial", "common", "community", "company", "compare", "computer", "concern", "condition", "conference", "congress",
  "consider", "consumer", "contain", "continue", "control", "cost", "could", "country", "couple", "course",
  "court", "cover", "create", "crime", "cultural", "culture", "current", "customer", "daughter", "decade",
  "decide", "decision", "defense", "degree", "democrat", "describe", "design", "despite", "detail", "determine",
  "develop", "device", "difference", "different", "difficult", "dinner", "direction", "director", "discover", "discuss",
  "disease", "doctor", "draw", "dream", "drive", "drop", "during", "early", "economic", "economy",
  "edge", "education", "effect", "effort", "eight", "either", "election", "employee", "energy", "enjoy",
  "enough", "enter", "entire", "environment", "environmental", "especially", "establish", "evening", "event", "everybody",
  "everyone", "everything", "evidence", "exactly", "example", "executive", "exist", "expect", "experience", "expert",
  "explain", "factor", "factory", "faculty", "family", "fashion", "father", "federal", "feeling", "field",
  "fight", "figure", "financial", "finger", "finish", "firm", "first", "fish", "flight", "floor",
  "focus", "follow", "food", "foot", "force", "foreign", "forget", "former", "forward", "friend",
  "future", "general", "generation", "glass", "global", "government", "great", "ground", "group", "growth",
  "guess", "happen", "happy", "health", "heart", "heavy", "history", "hospital", "hotel", "house",
  "human", "hundred", "husband", "identify", "image", "imagine", "impact", "important", "improve", "include",
  "including", "increase", "indicate", "individual", "industry", "inside", "instead", "institution", "interest", "international",
  "interview", "investment", "involve", "island", "issue", "item", "itself", "knowledge", "language", "large",
  "lawyer", "leader", "leadership", "learn", "least", "leave", "legal", "letter", "level", "light",
  "likely", "listen", "little", "local", "location", "machine", "magazine", "maintain", "major", "majority",
  "manage", "management", "manager", "market", "marriage", "material", "matter", "measure", "media", "medical",
  "meeting", "member", "memory", "mention", "message", "method", "middle", "might", "military", "million",
  "minute", "mission", "model", "modern", "moment", "money", "month", "morning", "mortgage", "movement",
  "nation", "national", "native", "natural", "nature", "necessary", "network", "never", "newspaper", "night",
  "normal", "north", "nothing", "notice", "number", "occur", "office", "officer", "official", "operation",
  "opportunity", "option", "order", "organization", "original", "others", "outside", "owner", "painting", "paper",
  "parent", "participant", "particular", "particularly", "partner", "party", "patient", "pattern", "peace", "people",
  "perform", "performance", "perhaps", "period", "person", "personal", "phone", "physical", "picture", "piece",
  "plant", "player", "point", "police", "policy", "political", "politics", "popular", "population", "position",
  "positive", "possible", "power", "practice", "prepare", "present", "president", "pressure", "pretty", "prevent",
  "price", "private", "probably", "problem", "process", "produce", "product", "production", "professional", "professor",
  "program", "project", "property", "protect", "prove", "provide", "public", "purpose", "quality", "question",
  "quickly", "quite", "radio", "raise", "range", "rate", "rather", "reach", "read", "ready",
  "reality", "realize", "really", "reason", "receive", "recent", "recently", "recognize", "record", "reduce",
  "reflect", "region", "relate", "relationship", "religious", "remain", "remember", "remove", "report", "represent",
  "require", "research", "resource", "respond", "response", "responsibility", "result", "return", "reveal", "rich",
  "right", "rise", "risk", "road", "rock", "role", "room", "rule", "safe", "same",
  "save", "scene", "schedule", "school", "science", "scientist", "score", "season", "seat", "second",
  "section", "security", "seek", "seem", "sell", "send", "senior", "sense", "series", "serious",
  "serve", "service", "seven", "several", "shake", "share", "shoot", "short", "shot", "should",
  "shoulder", "show", "side", "sign", "significant", "similar", "simple", "simply", "since", "sing",
  "single", "sister", "site", "situation", "skill", "skin", "small", "smile", "social", "society",
  "soldier", "somebody", "someone", "something", "sometimes", "source", "south", "southern", "space", "speak",
  "special", "specific", "speech", "spend", "sport", "spring", "staff", "stage", "stand", "standard",
  "start", "state", "statement", "station", "stay", "step", "still", "stock", "stop", "store",
  "story", "strategy", "street", "strong", "structure", "student", "study", "stuff", "style", "subject",
  "success", "successful", "such", "suddenly", "suffer", "suggest", "summer", "support", "surface", "system",
  "table", "take", "task", "teach", "teacher", "team", "technology", "television", "tell", "tend",
  "term", "test", "thank", "their", "theory", "there", "these", "thing", "think", "third",
  "threat", "three", "through", "throughout", "throw", "time", "today", "together", "tonight", "total",
  "tough", "toward", "town", "trade", "traditional", "training", "travel", "treat", "treatment", "trial",
  "trip", "trouble", "true", "truth", "turn", "under", "understand", "unit", "until", "upon",
  "value", "various", "victim", "view", "violence", "visit", "voice", "vote", "wait", "walk",
  "wall", "want", "watch", "water", "weapon", "wear", "week", "weight", "welcome", "western",
  "whatever", "where", "whether", "which", "while", "white", "whole", "whom", "whose", "wide",
  "wife", "window", "within", "without", "woman", "wonder", "word", "work", "worker", "world",
  "worry", "would", "write", "writer", "wrong", "yard", "yeah", "year", "young", "yourself",
];

const EXTENDED_UNIX = [
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
  "mmap", "futex", "kqueue", "io_uring", "spinlock", "rwlock", "coroutine", "channel", "semaphore", "barrier",
  "endian", "opcode", "syscalls", "affinity", "scheduler", "context", "backtrace", "debugger", "ptrace", "core",
  "dump", "profiler", "valgrind", "perf", "flamegraph", "hypervisor", "kvm", "qemu", "virtio", "container",
  "docker", "podman", "overlayfs", "cgroups", "seccomp", "apparmor", "selinux", "iptables", "nftables", "wireguard",
  "bpf", "ebpf", "xdp", "driver", "firmware", "acpi", "uefi", "grub", "initramfs", "bootloader",
  "assembly", "disasm", "decomp", "bytecode", "wasm", "jit", "llvm", "clang", "gcc", "ninja",
];

// Helper: Fisher-Yates array shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ── GET: Remote API with Instant Fallback ──────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "time";
  const vocab = searchParams.get("vocab") || "english";
  const tier = (searchParams.get("tier") || "short") as "short" | "medium" | "long";
  const count = Math.max(10, Math.min(100, parseInt(searchParams.get("count") || "35", 10)));

  // 1. QUOTE MODE: Attempt public quotes API first, fallback to curated bank
  if (mode === "quote") {
    try {
      // Primary API: dummyjson quotes
      const res = await fetch("https://dummyjson.com/quotes/random", {
        signal: AbortSignal.timeout(1800),
      });

      if (res.ok) {
        const data = await res.json();
        const rawQuote = String(data?.quote || "").trim();
        const rawAuthor = String(data?.author || "anonymous").trim();

        if (rawQuote.length >= 40) {
          // Normalize clean text
          const cleanText = rawQuote
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/\s+/g, " ")
            .toLowerCase();

          const len = cleanText.length;
          const detectedTier: "short" | "medium" | "long" =
            len < 125 ? "short" : len <= 165 ? "medium" : "long";

          // If the tier matches the user's requested tier, return immediately!
          if (detectedTier === tier) {
            return NextResponse.json({
              type: "quote",
              text: cleanText,
              source: rawAuthor,
              tier: detectedTier,
              origin: "api",
            });
          }
        }
      }
    } catch {
      // Network timeout or sandbox restriction: continue to fallback
    }

    // Secondary try: quotable.io
    try {
      const minLength = tier === "short" ? 50 : tier === "medium" ? 125 : 166;
      const maxLength = tier === "short" ? 124 : tier === "medium" ? 165 : 300;
      const res = await fetch(
        `https://api.quotable.io/random?minLength=${minLength}&maxLength=${maxLength}`,
        { signal: AbortSignal.timeout(1500) },
      );
      if (res.ok) {
        const data = await res.json();
        const rawQuote = String(data?.content || "").trim();
        const rawAuthor = String(data?.author || "anonymous").trim();

        if (rawQuote.length > 0) {
          const cleanText = rawQuote
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/\s+/g, " ")
            .toLowerCase();

          return NextResponse.json({
            type: "quote",
            text: cleanText,
            source: rawAuthor,
            tier,
            origin: "api",
          });
        }
      }
    } catch {
      // Fallback
    }

    // Local Fallback: Pick a random quote matching the requested tier
    const matchingFallback = FALLBACK_QUOTES.filter((q) => q.tier === tier);
    const pool = matchingFallback.length > 0 ? matchingFallback : FALLBACK_QUOTES;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    return NextResponse.json({
      type: "quote",
      text: picked.text,
      source: picked.source,
      tier: picked.tier,
      origin: "fallback",
    });
  }

  // 2. WORDS / TIME MODE: Attempt public random-word API, fallback to extended wordbanks
  if (vocab === "english") {
    try {
      const res = await fetch(
        `https://random-word-api.herokuapp.com/word?number=${count}`,
        { signal: AbortSignal.timeout(1500) },
      );
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length >= 10) {
          const cleanWords = list
            .map((w) => String(w).toLowerCase().trim())
            .filter((w) => /^[a-z]{2,10}$/.test(w));

          if (cleanWords.length >= 10) {
            return NextResponse.json({
              type: "words",
              words: cleanWords.slice(0, count),
              origin: "api",
            });
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  // Local Fallback for Words: Extended rich dictionary
  const sourcePool = vocab === "unix" ? EXTENDED_UNIX : EXTENDED_ENGLISH;
  const words: string[] = [];
  while (words.length < count) {
    const chunk = shuffleArray(sourcePool);
    words.push(...chunk);
  }

  return NextResponse.json({
    type: "words",
    words: words.slice(0, count),
    origin: "fallback",
  });
}
