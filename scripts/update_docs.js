#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO_URL = "https://github.com/heroui-inc/heroui.git";
const DEFAULT_REPO_DIR = path.resolve(__dirname, "..", "references", "heroui-repo");
const DOCS_SUBDIR = "apps/docs/content/docs";

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (result.error) return { ok: false, code: 1, error: result.error };
  return { ok: result.status === 0, code: result.status ?? 1 };
}

function ensureSparse(repoDir) {
  const sparse = run("git", ["-C", repoDir, "sparse-checkout", "set", DOCS_SUBDIR]);
  if (!sparse.ok) {
    process.exit(sparse.code);
  }
}

function updateExisting(repoDir) {
  run("git", ["-C", repoDir, "fetch", "--all", "--prune"]);
  run("git", ["-C", repoDir, "checkout", "main"]);
  ensureSparse(repoDir);
  const pull = run("git", ["-C", repoDir, "pull", "--ff-only", "origin", "main"]);
  if (!pull.ok) process.exit(pull.code);
}

function cloneFresh(repoDir) {
  const parent = path.dirname(repoDir);
  fs.mkdirSync(parent, { recursive: true });
  const clone = run("git", [
    "clone",
    "--depth",
    "1",
    "--filter=blob:none",
    "--sparse",
    REPO_URL,
    repoDir,
  ]);
  if (!clone.ok) process.exit(clone.code);
  ensureSparse(repoDir);
}

function main() {
  const repoDir = DEFAULT_REPO_DIR;
  if (fs.existsSync(path.join(repoDir, ".git"))) {
    updateExisting(repoDir);
  } else {
    cloneFresh(repoDir);
  }
}

main();
