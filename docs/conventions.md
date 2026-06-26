# Coding Conventions

> This file records coding conventions for darts-wien.  
> When new patterns or style rules are established, add them here.

---

## TypeScript

- All code in TypeScript. Strict mode enabled.
- Avoid `any` — use `unknown` and type guards instead.
- Prefer `interface` over `type` for object shapes, unless union/intersection is needed.

## React Components

- React Server Components by default. Only add `"use client"` when:
  - Using event handlers (`onClick`, `onChange`, etc.)
  - Using hooks (`useState`, `useEffect`, etc.)
  - Using browser-only APIs
- Component files: one component per file (except small private helpers).
- Props type declared inline or as a named interface in the same file.

## Imports

- Group order: React/Next → external libraries → `@/` path alias → relative imports → styles.
- Use `@/` for all internal project imports.

## Styling

- Use CSS Modules for component-specific styles.
- Use `globals.css` only for CSS reset and CSS custom properties (design tokens).
- No inline styles except for truly dynamic values.

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | `PlayerCard.tsx` |
| Hooks | camelCase, `use` prefix | `usePlayers.ts` |
| Utilities | camelCase | `formatScore.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_PLAYERS` |
| Files/directories | kebab-case | `player-card/` |

## Git

- Commit messages: present tense, concise. Prefer conventional commits (`feat:`, `fix:`, `refactor:`, etc.).
- One logical change per commit.

## Testing

_No testing framework configured yet. Document the approach when one is added._
