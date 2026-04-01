---
name: zotero-plugin-skill
description: Use this skill when implementing, extending, or reviewing a Zotero plugin. It captures the template's architecture, Zotero integration points, and coding conventions.
---

# Zotero Plugin Template

## When to Use

Load this skill when:

- Adding or modifying plugin behavior in a repo based on this template.
- Mapping a feature request to the correct bootstrap hook, module, or static addon file.
- Reviewing whether a change follows this template's Zotero API usage and coding style.

## Agent Command Safety

Follow these command rules strictly:

- **DON'T:** `npm start` (blocks), `npm run release` (interactive).
- **DON'T:** run `lsp_diagnostics` for files under `test/`; `test/` is not part of the effective TypeScript project in this template, so diagnostics there can be misleading. Use build, lint, and test commands for validation instead.
- **DO:**
  ```bash
  npm run build
  npm run lint:check
  npm run test -- --exit-on-finish
  ```

## Core Philosophy

- **Lifecycle First:** Start from the plugin lifecycle in `src/hooks.ts`; every feature should have a clear startup, per-window setup, and cleanup path.
- **Structure:** Bootstrap wiring → `src/hooks.ts` → `src/modules/*.ts` logic.
- **Assets:** `addon/**` for static resources (manifest, locale, prefs, CSS).
- **Naming:** Build IDs, prefs, and paths from `package.json` config (`addonRef`, `addonID`, etc.).

## Architecture Overview

- `src/index.ts`: Sandbox entry, creates addon instance at `Zotero[config.addonInstance]`.
- `src/hooks.ts`: Lifecycle coordination hub. This is the main map for when plugin code runs: global startup/shutdown plus per-window load/unload.
- `src/modules/*.ts`: Core feature logic and UI implementations.
- `addon/**`: Static resources (manifest, locale, prefs, XHTML).
- **Build Flow:** `src/` → `esbuild` → `.scaffold/build/addon/content/scripts/${addonRef}.js`.

## Lifecycle Emphasis

- Treat `src/hooks.ts` as the first file to inspect when planning or reviewing changes.
- Map each feature to the right lifecycle stage:
  - `onStartup()`: one-time global initialization.
  - `onMainWindowLoad(window)`: register UI for each Zotero main window.
  - `onMainWindowUnload(window)`: remove per-window UI/listeners.
  - `onShutdown()`: final global teardown.
- If a feature allocates UI, observers, listeners, timers, or global state, document where it is cleaned up.
- Prefer modules for implementation, but always wire them through an explicit lifecycle entry point.

## Workflow

1. **Lifecycle:** Decide whether the change belongs in startup, per-window load, per-window unload, shutdown, or a specialized hook.
2. **Logic:** Implement feature in `src/modules/` or `src/utils/`.
3. **Register:** Wire the module into the relevant hook in `src/hooks.ts`.
4. **Assets:** Add `.ftl` strings or `.xhtml` markup in `addon/` if needed.
5. **Cleanup:** Add teardown logic to `onMainWindowUnload` or `onShutdown` for everything registered earlier.
6. **Validate:** Run `npm run build` and `npm run lint:check`.

## Design Principles

- **Coordination Hooks:** Keep `hooks.ts` for registration only, not business logic.
- **Lifecycle Completeness:** Every setup path should have a matching teardown path.
- **Central State:** Store long-lived plugin state in `addon.data`.
- **TypeScript:** Use strong types; limit `any` to sandbox/Zotero boundaries.
- **Config-Driven:** Never hardcode IDs/prefixes; use `config` from `package.json`.
- **Async & Gating:** Await `Zotero.initializationPromise` and `Zotero.uiReadyPromise` before UI work.
- **Cleanup Discipline:** Always call `ztoolkit.unregisterAll()` and manual unregisters on shutdown.
- **Fluent:** Prefer FTL-backed strings via `getString()` for all user-facing text.

## Constraints

- **Don't** bypass `package.json` config for identity/naming.
- **Don't** put business logic in `src/hooks.ts`.
- **Don't** use raw preference keys without the `prefsPrefix`.
- **Don't** forget cleanup for non-toolkit registered observers/UI.
- **Don't** hand-roll `extra` field parsing unless there is a clear reason not to use `ExtraFieldTool`.
- **Don't** claim Zotero 9 support (Template target: 7/8).

## References

- [Lifecycle & Hooks](references/lifecycle-api.md)
- [Menus & Context](references/menu-api.md)
- [Columns & Tables](references/column-api.md)
- [Extra Field API](references/extra-field-api.md)
- [UI & Toolkit](references/ui-api.md)
- [Repository Map](references/repo-map.md)
