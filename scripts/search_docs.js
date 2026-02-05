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

// Prefer ripgrep if available.
let result = run("rg", ["-n", "--context", "2", "--iglob", "*.md*", query, docsPath]);
if (result.error) {
  // Fallback to grep if rg is not installed.
  result = run("grep", ["-R", "-n", query, docsPath]);
}

process.exit(result.status ?? 0);
