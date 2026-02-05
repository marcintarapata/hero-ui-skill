---
name: heroui
description: Build React components with Hero UI using the local Hero UI v2 documentation (for @heroui/react 2.8.x). Use when implementing or updating UI components, layouts, or Tailwind-based styling in existing React projects that rely on Hero UI (not v3), and when you need accurate, docs-based component APIs, examples, or usage patterns.
---

# Hero UI (v2) Builder

## Overview

Use local Hero UI docs to build or update React components in existing projects that use `@heroui/react@2.8.x`. Prefer docs-backed APIs and examples. Avoid v3 guidance unless explicitly asked.

## Quick Start

1. Identify the component(s) needed and the project context (framework, styling conventions).
2. Search the local docs for the component and API details.
3. Implement the component in the target codebase using the docs-backed props and patterns.
4. Verify Tailwind class usage and composition with Hero UI defaults.

## Version Guardrails

- Assume `@heroui/react@2.8.8` unless the user explicitly requests v3.
- If docs content appears v3-only, warn and ask for confirmation before using it.

## Local Docs

The Hero UI docs are stored locally in this skill:
- Repo root: `references/heroui-repo`
- Docs content: `references/heroui-repo/apps/docs/content/docs`

## Search Docs (Local)

Use the bundled search script:

```bash
node scripts/search_docs.js "Button" --path references/heroui-repo/apps/docs/content/docs
```

Notes:
- The script uses `rg` if available, otherwise falls back to `grep`, then a pure JS scan.
- Prefer reading the specific doc file(s) surfaced by search before implementing.
- If the docs repo is missing, the script will auto-clone it.

## Update Docs (Local)

Update the local docs snapshot (or clone if missing):

```bash
node scripts/update_docs.js
```

## Workflow

1. Clarify component goal and constraints (variant, size, theming, layout).
2. Run doc search to locate the relevant component page.
3. Read the doc section(s) covering props, composition, and examples.
4. Implement component(s) using the documented API.
5. Cross-check for required imports and any provider/wrapper needs.
6. Keep changes minimal and consistent with existing project style.

## Common Tasks

- Build a new component using Hero UI primitives.
- Update props or variants for an existing Hero UI component.
- Compose multiple Hero UI components into a layout.
- Troubleshoot styling by aligning Tailwind classes with Hero UI defaults.

## Resources

- `scripts/search_docs.js` for local documentation search.
- `references/heroui-repo/apps/docs/content/docs` for the authoritative v2 docs content.
