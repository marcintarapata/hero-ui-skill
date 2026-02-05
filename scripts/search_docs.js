#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = { query: null, path: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--path" && i + 1 < argv.length) {
      args.path = argv[i + 1];
      i++;
      continue;
    }
    rest.push(a);
  }
  if (rest.length > 0) args.query = rest.join(" ");
  return args;
}

function run(cmd, cmdArgs) {
  return spawnSync(cmd, cmdArgs, { stdio: "inherit" });
}

const { query, path: customPath } = parseArgs(process.argv.slice(2));
if (!query) {
  console.error("Usage: node scripts/search_docs.js \"query\" [--path <docsPath>]");
  process.exit(2);
}

const repoDir = path.resolve(__dirname, "..", "references", "heroui-repo");
const defaultDocsPath = path.resolve(repoDir, "apps", "docs", "content", "docs");
const docsPath = customPath ? path.resolve(process.cwd(), customPath) : defaultDocsPath;

// Auto-clone/update if the docs repo is missing.
if (!customPath) {
  const repoGitDir = path.join(repoDir, ".git");
  if (!fs.existsSync(repoGitDir)) {
    const updater = path.resolve(__dirname, "update_docs.js");
    const upd = run(process.execPath, [updater]);
    if (upd.error || (upd.status ?? 1) !== 0) {
      process.exit(upd.status ?? 1);
    }
  }
}

function printRgTip() {
  console.error("");
  console.error("Tip: Install ripgrep for faster search.");
  console.error("Windows: winget install BurntSushi.ripgrep");
  console.error("macOS:   brew install ripgrep");
  console.error("Linux:   sudo apt install ripgrep  (or your distro package manager)");
  console.error("");
}

function isTextFile(name) {
  return name.endsWith(".md") || name.endsWith(".mdx");
}

function searchFile(filePath, needleLower) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(needleLower)) hits.push(i);
  }
  return { lines, hits };
}

function searchTree(rootDir, needle) {
  const stack = [rootDir];
  const needleLower = needle.toLowerCase();
  let matched = 0;
  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!ent.isFile() || !isTextFile(ent.name)) continue;
      const { lines, hits } = searchFile(full, needleLower);
      if (hits.length) {
        matched++;
        for (const idx of hits) {
          const lineNo = idx + 1;
          const line = lines[idx];
          console.log(`${full}:${lineNo}:${line}`);
          // Simple 2-line context
          for (let c = 1; c <= 2; c++) {
            if (idx + c < lines.length) {
              console.log(`${full}:${lineNo + c}:${lines[idx + c]}`);
            }
          }
        }
      }
    }
  }
  return matched;
}

// Prefer ripgrep if available.
let result = run("rg", ["-n", "--context", "2", "-i", "--iglob", "*.md*", query, docsPath]);
if (result.error) {
  // Fallback to grep if rg is not installed.
  result = run("grep", ["-R", "-n", "-i", query, docsPath]);
}

if (result.error) {
  // Final fallback: pure JS scan (cross-platform, slower).
  printRgTip();
  const matched = searchTree(docsPath, query);
  process.exit(matched > 0 ? 0 : 1);
}

process.exit(result.status ?? 0);
