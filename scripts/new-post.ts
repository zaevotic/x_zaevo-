#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_ ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const args = process.argv.slice(2);
const title = args.join(" ").trim() || "New Journal Entry";
const slug = slugify(title) || "untitled-entry";
const date = new Date().toISOString().slice(0, 10);
const filename = `${date}-${slug}.md`;

const targetDir = path.join(process.cwd(), "content/journal");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetPath = path.join(targetDir, filename);

if (fs.existsSync(targetPath)) {
  console.error(`\x1b[31m[err]\x1b[0m File already exists: ${filename}`);
  process.exit(1);
}

const template = `---
title: "${title}"
date: "${date}"
tags: ["linux", "systems"]
draft: false
excerpt: "A brief summary of this journal entry..."
callout: "Key architectural takeaway or diagnostic note."
---

## Overview

Start writing your technical notes here...

\`\`\`bash
# Diagnostic command
echo "zaevo.dev/journal/${slug}"
\`\`\`
`;

fs.writeFileSync(targetPath, template, "utf8");

console.log(`\x1b[32m[ok]\x1b[0m Created new journal post:`);
console.log(`     Path: content/journal/${filename}`);
console.log(`     Edit: nvim content/journal/${filename}`);

