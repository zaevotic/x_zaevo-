"use client";

export default function JournalHeader({ count = 0 }: { count?: number }) {
  return (
    <p className="text-[10px] tracking-[.04em] mb-[12px]" style={{ color: "var(--text3)" }}>
      {"// "}
      <span style={{ color: "var(--amber)" }}>
        {count} {count === 1 ? "entry" : "entries"}
      </span>{" "}
      · draft → publish pipeline
    </p>
  );
}
