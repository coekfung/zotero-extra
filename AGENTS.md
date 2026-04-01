# AGENTS

## Project

- Name: Zotero Extra
- Stack: Zotero plugin template + TypeScript
- Target: Zotero 8 only
- Main direction: build extensible features around the item's `extra` field

## Repo map

- `src/index.ts`: sandbox entry; exposes the addon instance on `Zotero`
- `src/hooks.ts`: lifecycle coordinator; keep this thin
- `src/modules/*.ts`: feature logic
- `src/utils/*.ts`: helpers for prefs, locale, windows, toolkit setup
- `addon/`: static assets such as manifest, locale, prefs, CSS, XHTML
- `test/*.test.ts`: Mocha tests

## Source of truth

- Use this file for repository-specific guidance.
- Also load the `zotero-plugin-template` skill for template architecture and Zotero API conventions.

## Setup

- Install dependencies with `npm install`.
- Local env file is expected for normal development; copy from `.env.example` if needed.

## Build, lint, and test commands

### Main commands

- `npm run build` — runs `zotero-plugin build && tsc --noEmit`
- `npm run lint:check` — runs Prettier check and ESLint
- `npm run lint:fix` — runs Prettier write and ESLint fix
- Do not run `npm start` unless the user explicitly wants an interactive dev session.
- Do not run `npm run release` unless the user explicitly asks for a release build.

### Single-test and targeted test guidance

- Preferred full test run: `npm run test`
- For a single file or filtered test, try Mocha-style passthrough first:
  - `npm run test -- test/venueAlias.test.ts`
  - `npm run test -- --grep "venue alias"`
- There is no dedicated npm script for single-test execution in this repo.
- If passthrough flags do not behave as expected under `zotero-plugin test`, fall back to the full suite.

### CI expectations

- CI runs lint, then build, then test.
- Match CI locally before finishing substantial changes.

## Architecture and lifecycle rules

- Start from `src/hooks.ts` when planning feature work.
- Hooks should dispatch only; real logic belongs in modules.
- Keep setup and cleanup paired: startup ↔ shutdown, main-window load ↔ main-window unload.
- If code registers UI, observers, listeners, timers, or windows, add explicit teardown.
- Use `addon.data` for long-lived plugin state.
- Use `config` from `package.json` for addon identity and pref prefixes.
- Never hardcode addon IDs, pref prefixes, or addon global names.

## Code style

### Formatting

- Respect Prettier in `package.json`: print width 80, tab width 2, LF endings.
- Use 2-space indentation, semicolons, and single quotes in TypeScript files.
- Let Prettier decide formatting; do not hand-format against it.

### Imports

- Prefer explicit imports at the top of each file.
- Keep relative imports local and concise.
- Import `config` from `package.json` instead of duplicating addon constants.
- Import toolkit helpers and types from their packages rather than recreating equivalents.

### Types

- Prefer explicit types at Zotero and sandbox boundaries.
- Use strong TypeScript types; avoid `any` unless a Zotero/runtime boundary makes it unavoidable.
- Keep unsafe surfaces narrow for event payloads and external data.
- Prefer small interfaces and type guards when decoding unknown payloads.
- Use `@ts-expect-error` only for real typing gaps and keep the comment specific.

### Naming

- PascalCase for classes, enums, and factory-style modules.
- camelCase for functions, variables, and helpers.
- UPPER_SNAKE_CASE for real constants such as API URLs or field keys.
- Match existing terminology around `extra`, venue alias, prefs, locale, and hooks.
- Keep user-facing copy branded as `Zotero Extra`.

### Functions, async work, and side effects

- Prefer small, focused functions and cohesive modules.
- Prefer pure helpers for parsing, normalization, summarization, and data shaping.
- Use classes or factory-style wrappers only when they fit the surrounding template pattern.
- Await `Zotero.initializationPromise`, `Zotero.unlockPromise`, and `Zotero.uiReadyPromise` before UI work.
- Use `void` for intentional fire-and-forget async calls.
- Keep side effects near lifecycle entry points or clearly named module methods.

### Error handling

- Fail narrowly and deliberately.
- Parse unknown errors defensively.
- Handle known recoverable cases explicitly, such as 404/not-found responses.
- Log actionable failures with useful context through `ztoolkit.log`.
- When continuing after per-item failure in a batch operation, count and report the failure.

### Zotero-specific conventions

- Prefer Fluent/FTL-backed strings for user-facing text via locale helpers.
- Prefer wrapper utilities for prefs instead of calling raw pref keys throughout the codebase.
- Use `ExtraFieldTool` and related toolkit helpers for `extra`-field behavior.
- Call `ztoolkit.unregisterAll()` during teardown where appropriate.

## Testing guidance

- Add or update tests for non-trivial logic changes.
- Prefer testing pure module logic directly when possible.
- Keep tests deterministic and isolated from network behavior unless the scaffold clearly provides a safe harness.
- For parsing and normalization logic, add focused tests in `test/*.test.ts`.

## Planning and PR workflow

- Prefer the smallest coherent PR that delivers a clean, reviewable change.
- Keep planning out of repo files. Do not add `PLAN.md`, `TODO.md`, `ROADMAP.md`, scratch notes, or temporary checklists.
- For a small one-step change, keep the plan in the PR description.
- For a multi-step initiative, create a GitHub issue as the initiative plan.

### Multi-step initiative workflow

- Put these in the issue:
  - goal / user-facing outcome
  - constraints or approach notes
  - a short checklist of concrete steps
  - deferred or out-of-scope items
- Implement the issue through focused PRs.
- Default to one PR per logical step.
- Group steps into one PR only when they are tiny, tightly coupled, or not meaningful to review separately.
- Each PR should link the parent issue, for example `Part of #123`.
- Update the issue checklist as PRs merge or scope changes.

### Avoid repo pollution

- No standalone planning docs for one-off work.
- No agent scratch files, dated notes, or temporary checklists.
- No orphaned TODOs in code for later work; keep that context in the issue or PR.

### Persistent docs

- Add a durable repo doc only when it is meant to guide future work across multiple PRs.
- Good candidates:
  - architecture decisions
  - `extra`-field schema or contracts
  - migration behavior
  - stable user-visible behavior future changes must preserve
- Not good candidates:
  - phase plans
  - feature task lists
  - session notes
  - single-PR implementation checklists
- Rule of thumb: issue/PR for execution planning, repo docs for durable system behavior.

## Agent checklist before finishing

- Run `npm run lint:check` if code style may have changed.
- Run `npm run build` for code changes.
- Run `npm run test` when logic or tests changed.
- Confirm lifecycle cleanup exists for anything registered during startup or window load.
- Keep hooks thin and keep business logic in modules.
