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

### Kotlin file organization

- **One top-level class per file.** Each `class`, `data class`, `object`, or `interface` lives in its own file named after the declaration. This includes companion types like JPA `@IdClass` keys, DTO pairs (request/response), and small result records — split them all into individual files.
- **No fully-qualified names in code bodies.** Always add an `import` and reference the simple name. This applies to extension receivers too: write `private fun MovieEntity.toDomain()`, never `private fun com.watchtonext.api.persistence.entity.MovieEntity.toDomain()`.
- Top-level extension functions (file-level utilities, no class wrapper) may share a file when they form a cohesive group, but prefer a dedicated file once the group grows past ~3 functions.

### Error handling

- Every error response uses the project's `ApiError` shape with an `ErrorEnum` code; the global `@RestControllerAdvice` (`controller/advice/GlobalExceptionHandler`) takes care of the mapping. Do not catch exceptions in controllers to translate them, and do not invent ad-hoc error response bodies.
- In services, signal request failures by throwing `ResponseStatusException(<HttpStatus>, "<user-facing reason>")`. Do not use `require(...)` / `check(...)` for request validation — those reserve themselves for genuine programmer-error invariants.
- Never echo the original exception message, stack trace, SQL, or any other internal state in the response body. Log the cause; return a deterministic, public-safe message.
- See [error-handling.md](./error-handling.md) for the full catalog and the contract.

### REST controller layout

- The API base path `/api` is applied **globally** via `WebMvcConfig` (`PathMatchConfigurer.addPathPrefix`) — controllers must never hard-code `/api/...` in their `@RequestMapping`.
- Each `@RestController` maps to a **single top-level resource** (e.g. `/ratings`, `/favorites`, `/recommendations`). Do not group unrelated resources under one controller, and do not nest paths like `/users/{userId}/ratings` inside `@RequestMapping`.
- Identifiers that are *contextual* (the acting user, tenant, etc.) belong as `@RequestParam` or, later, an `@AuthenticationPrincipal`-derived value — not as a parent path segment. Only the resource's own id should appear in the path.
- Controllers stay thin: parse, delegate to a service, map the result to a DTO, return. No business logic.

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