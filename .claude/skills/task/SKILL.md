---
name: task
description: Run the full watchToNext task pipeline — intake, scope check, plan, implement, wrap — with a checkpoint between each phase so the user can review before continuing.
---

# Task pipeline (watchToNext)

End-to-end workflow for turning a task title into a merged-ready change. Always follow `CLAUDE.md` and `docs/coding-standards.md` — they are non-negotiable.

**Argument:** the task title (free text). If absent, ask for one before starting.

## Operating rules

- This skill runs **phase-by-phase**, not all at once. After finishing a phase, **stop and wait for the user's explicit go-ahead** ("ok", "next", "continue", or edits) before starting the next. Do not chain phases automatically.
- The user keeps normal command-approval control — never bypass permission prompts and never use `--no-verify` / `--no-gpg-sign` / force-push.
- If the user redirects mid-phase, adapt and re-checkpoint; do not silently resume the old plan.
- Keep responses tight. The phase deliverable is the output, not commentary about it.

## Phase 1 — Intake

**Input:** task title.
**Do:**
1. Restate the title as you understand it (one line).
2. Ask up to **3** clarifying questions only if genuinely blocking (audience, surface area, must-include vs out-of-scope). Skip if the title is self-explanatory.

**Output:** one-paragraph task description + clarifications resolved.
**Checkpoint:** wait for approval before Phase 2.

## Phase 2 — Scope check

**Do:**
1. Read the relevant slice of the codebase (frontend module or backend module) — don't grep the whole repo, target the area the task touches.
2. Identify: existing features that overlap, files that will change, integration points (TMDB, KNN engine, Redis cache, Keycloak), and anything that conflicts with current behavior.
3. Flag risks: breaking changes, migrations, env vars, new dependencies.

**Output:** short report — *Touches*, *Reuses*, *Conflicts/Risks*, *Open questions*. Bullet form, no prose padding.
**Checkpoint:** wait for approval before Phase 3.

## Phase 3 — Plan (task card)

**Do:** write/update `task.md` at repo root using the template at `.claude/skills/task/templates/task-card.md`. **Omit** metadata block, commit suggestion, and checkbox markers — plain bullets only (the template already reflects this).

Also create a TaskCreate task list mirroring the Escopo bullets so progress is trackable.

**Checkpoint:** wait for approval (or edits to `task.md`) before Phase 4.

## Phase 4 — Implement

**Do:**
1. Work through the TaskCreate list, marking items done as you finish them (one at a time, not batched).
2. Obey `docs/coding-standards.md` strictly:
   - Frontend: functional components, TS interfaces, no business logic in UI, services for API calls, animations via `@/utils/animations` only.
   - Backend: thin controllers, one top-level class per file, no FQNs in bodies, `ResponseStatusException` for request failures, never echo internal state in error bodies, no hard-coded `/api/...` in `@RequestMapping`.
3. Run the relevant checks before declaring done:
   - Frontend: `npm run lint` and `npx tsc --noEmit` (from `frontend/`).
   - Backend: the module's Gradle build/test task.
4. For UI changes, state explicitly whether you tested in a browser. If you didn't, say so — don't claim success.

**Checkpoint:** when the change compiles, lints, and types cleanly, summarize what changed (files + one-line each) and stop. Wait for approval before Phase 4.5.

## Phase 4.5 — Sync Postman + docs

**Do:** update the surfaces that document the API and the project. Skip a bullet only when the change demonstrably doesn't touch that surface.

- **Postman** (`backend/postman/watchToNext.postman_collection.json`): for every new/changed endpoint, add or update the request — method, path (under `{{baseUrl}}`), query params, example body. Reuse existing collection variables (`{{baseUrl}}`, `{{userId}}`, etc.) instead of hard-coding values. Remove requests for endpoints that were deleted or renamed.
- **`docs/backend.md`**: update the endpoint table / sections when a route, query param, request body, or response shape changes. New endpoint → new row. New cache → mention it.
- **`docs/frontend.md`**: update when a user-facing route, page behavior, hook contract, or service contract changes. New URL state pattern, new shared hook shape, new env var → document it.
- **`docs/architecture.md` / `docs/recommender-model.md` / other docs**: touch only if the change shifts something they describe (new module, new integration, algorithm tweak).

**Checkpoint:** list the files touched (one line each) and stop. Wait for approval before Phase 5.

## Phase 5 — Wrap (PR description)

**Do:**
1. Write the filled-in PR description to `pr.md` at the repo root, using the template at `.claude/skills/task/templates/pr-description.md`.
   - Title uses the project's conventional-commit + gitmoji style.
   - The template's **Test plan** section holds the test steps — cover the golden path **and** the main edge cases identified in Phase 2.
   - Overwrite any existing `pr.md` (it's a transient artifact for copy/paste into GitHub, not a tracked file).
   - Print only a one-line confirmation in chat (e.g. `pr.md written — 42 lines`). Do not dump the full body into chat; the file is the deliverable.
2. **Always** plan the commit organization next — don't wait to be asked. Propose a logical sequence of commits (each one independently reviewable, building forward) so the user can review the plan before any commit happens. Each entry must include the conventional-commit + gitmoji subject and the files it covers. Group by atomic concern (e.g. backend endpoint, frontend types, UI wiring, docs/postman sync); avoid one giant catch-all commit. Print this as a short numbered list in chat.

**Final checkpoint:** the pipeline ends here. **Never run `git add`, `git commit`, `git branch`, `git push`, or `gh pr create` as part of `/task`** — even if the user previously approved the commit plan. The commit plan is a *deliverable*, not an instruction to act. The user owns staging, branching, committing, and pushing. Only run those commands if the user explicitly asks for them in a separate, post-pipeline message ("commit it", "push", "open the PR"), and only with the scope they specify.

## Resuming mid-pipeline

If the user invokes `/task` again with the same title or says "continue the pipeline", figure out the last completed phase from `task.md` + TaskCreate state and resume from the next phase. If unclear, ask which phase to resume from.
