# Coding Standards

## General Principles

- Write clean and readable code
- Prefer modular architecture
- Avoid large components or classes
- Follow separation of concerns

## Frontend

- Use functional components
- Use TypeScript interfaces
- Avoid business logic inside UI components
- Use services for API calls

## Backend

- Follow layered architecture
- Controllers should be thin
- Business logic must live in services
- Use DTOs for API communication

## Naming Conventions

Components:
PascalCase

Variables:
camelCase

Constants:
UPPER_CASE

Files:
kebab-case or camelCase

## Animation Standards

The animation library is **framer-motion**.

- Import variants from `@/utils/animations` — never define one-off variants inline in a component.
- `AnimatedGrid` + `cardItem` variant is the standard pattern for any staggered list of cards.
- `heroStagger` + `fadeUp` is the standard pattern for page hero sections (heading → subtitle → CTAs).
- Use `AnimatePresence` with `mode="wait"` for content that conditionally appears or disappears (search results, empty states, modals).
- Only animate `opacity`, `y`, and `scale`. Never animate layout-affecting properties (`width`, `height`) — they cause reflows and hurt performance.
- Pages that use `motion` components must be `"use client"`.

## Commit Convention

Use **Conventional Commits** with **gitmoji** prefixes:

```
<emoji> <type>[optional scope]: <description>
```

Common types and their emoji:

| Emoji | Type | When to use |
|-------|------|-------------|
| ✨ | `feat` | New feature |
| 🐛 | `fix` | Bug fix |
| ♻️ | `refactor` | Code change that neither fixes a bug nor adds a feature |
| 💄 | `style` | UI / styling changes |
| 📝 | `docs` | Documentation only |
| 🧪 | `test` | Adding or updating tests |
| 🔧 | `chore` | Build process, tooling, dependencies |
| 🚀 | `perf` | Performance improvement |
| 🎉 | `init` | Initial commit / project bootstrap |

Examples:
```
✨ feat(search): add debounced search input
🐛 fix(hooks): move setLoading inside async function to avoid cascade renders
📝 docs(claude): add commit convention section
🔧 chore(deps): add clsx and tailwind-merge
```