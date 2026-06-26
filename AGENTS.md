# darts-wien — Project Memory & Rules

> This is the primary rules file for OpenCode.  
> Agents MUST read this file first in every session.  
> Agents MUST update this file when important decisions, patterns, or context emerge.

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Identity

- **Name:** darts-wien
- **Description:** [Describe what this app does]
- **Type:** Next.js App Router web application

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| UI | React | 19.2.4 |
| Language | TypeScript (strict) | 5.x |
| Linting | ESLint (`eslint-config-next`) | 9.x |
| Package Manager | npm | — |
| Styling | CSS Modules / Global CSS | — |

---

## Project Structure

```
darts-wien/
├── src/
│   └── app/                  # App Router pages and layouts
│       ├── globals.css       # Global styles (reset, design tokens)
│       ├── layout.tsx        # Root layout
│       └── page.tsx          # Home page
├── docs/                     # Detailed architecture decisions, conventions
│   ├── architecture.md       # ADRs (Architecture Decision Records)
│   └── conventions.md        # Coding conventions (full detail)
├── public/                   # Static assets
├── opencode.json             # OpenCode config (instructions, tools)
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## Commands

```bash
npm run dev       # Dev server → http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

---

## Conventions (quick reference)

> Full detail in `docs/conventions.md`

- **TypeScript:** Strict. No `any` without justification. `@/*` alias for `src/*`.
- **Components:** Server Components by default. `"use client"` only when using hooks/events/browser APIs.
- **Imports:** React/Next → external libs → `@/` alias → relative → styles.
- **Styling:** CSS Modules for components, `globals.css` for reset + design tokens.
- **Naming:** PascalCase components, camelCase functions, kebab-case files.
- **Git:** Conventional commits (`feat:`, `fix:`, etc.).

---

## Architecture Decisions

> See `docs/architecture.md` for full records.

_No decisions recorded yet._

---

## Available Skills

| Skill | Location | Use Case |
|-------|----------|----------|
| `grill-me` | `.opencode/skills/grill-me/` | Load this skill when the user says "grill me", "stress test", or wants to relentlessly interrogate a plan or design before implementing. Interviews the user branch-by-branch until shared understanding is reached. |

---

## Memory & Agent Instructions

### What to update and when

| File | When to update |
|------|---------------|
| **AGENTS.md** (this file) | New dependency, new pattern, structure change, ADR summary, new convention |
| `docs/architecture.md` | Any architectural decision (why X over Y) |
| `docs/conventions.md` | New coding conventions or style rules |

### Workflow

1. **Read this file** at the start of every session.
2. **Read `docs/architecture.md`** before making architectural changes.
3. **Read `docs/conventions.md`** for full convention details.
4. After making changes, **run `npm run build` and `npm run lint`** — fix all issues.
5. **Update memory files** if your changes introduced anything worth remembering for future sessions.
6. **Be concise.** Don't explain code unless asked. Don't add comments unless logic is non-obvious.
