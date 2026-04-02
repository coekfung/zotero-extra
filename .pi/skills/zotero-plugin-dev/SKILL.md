---
name: zotero-plugin-dev
description: Guide for developing Zotero 8 plugins. Use this skill whenever working on Zotero plugins, adding features like UI elements (item tree columns, pane sections, menus, dialogs), handling Zotero data (items, collections, metadata), integrating with Zotero lifecycle events, creating new plugin modules, or debugging plugin functionality. Also use when modifying existing features, working with the zotero-plugin-toolkit, or implementing preferences and localization.
---

# Zotero Plugin Development

Guide for building Zotero 8 plugins.

## Project Structure

```
src/
├── index.ts          # Entry point - usually leave unchanged unless changing bootstrap wiring
├── addon.ts          # Addon class - data store, API container
├── hooks.ts          # Lifecycle handlers - wire up features here
├── modules/          # Your feature modules
└── utils/            # Utilities (ztoolkit, locale, prefs)
```

## Quick Start

1. Create a feature module in `src/modules/`
2. Wire it up in `hooks.ts` lifecycle hooks
3. Use current Zotero 8 APIs and toolkit helpers where available
4. Clean up module-owned resources in `onShutdown()`

See [Adding Features](references/adding-features.md) for the complete workflow.

## When to Use Which Reference

| Task | Reference |
|------|-----------|
| Create a new feature module | [adding-features.md](references/adding-features.md) |
| Understand project structure | [architecture.md](references/architecture.md) |
| Add UI (columns, menus, sections, dialogs) | [ui-patterns.md](references/ui-patterns.md) |
| Work with items, Extra field, notifiers | [data-access.md](references/data-access.md) |
| Add translations | [localization.md](references/localization.md) |
| Cleanup resources, debug issues | [cleanup-debugging.md](references/cleanup-debugging.md) |

## Toolkit API Overview

The [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit) provides these utilities:

| Tool | Purpose | Reference |
|------|---------|-----------|
| `ztoolkit.ExtraField` | Get/set Extra field values | [data-access.md](references/data-access.md#extra-field-toolkit-api) |
| `ztoolkit.Dialog` | Create dialog windows | [ui-patterns.md](references/ui-patterns.md#dialog) |
| `ztoolkit.FilePicker` | File/folder selection | [ui-patterns.md](references/ui-patterns.md#file-picker) |
| `ztoolkit.Clipboard` | Copy text/HTML | [ui-patterns.md](references/ui-patterns.md#clipboard) |
| `ztoolkit.ProgressWindow` | User notifications | [ui-patterns.md](references/ui-patterns.md#progress-window) |
| `ztoolkit.VirtualizedTable` | Tables in preferences | [ui-patterns.md](references/ui-patterns.md#virtualized-table-preferences) |
| `ztoolkit.Reader` | Access the Zotero reader | [data-access.md](references/data-access.md#reader-toolkit) |
| `ztoolkit.Keyboard` | Global shortcuts | [ui-patterns.md](references/ui-patterns.md#keyboard-shortcuts) |
| `ztoolkit.UI.createElement` | Create DOM elements | [architecture.md](references/architecture.md#utilities) |

**Rule:** Always check if ztoolkit provides an API before writing custom implementations.

**Best practice:** Treat scaffold examples as a starting point, not as the final architecture. Prefer current non-deprecated APIs, remove demo code early, and keep cleanup ownership inside feature modules.

## Common Tasks

### Add a Feature

See [adding-features.md](references/adding-features.md) for:
- Feature module template
- Wiring up in `hooks.ts`
- Cleanup patterns

### Add UI Elements

See [ui-patterns.md](references/ui-patterns.md) for:
- Item tree columns
- Item pane sections
- Context menus
- Keyboard shortcuts
- Dialogs

### Work with Data

See [data-access.md](references/data-access.md) for:
- Getting selected items
- Extra field (via toolkit)
- Notifier events
- Search

### Add Localization

See [localization.md](references/localization.md) for:
- Fluent file syntax
- JavaScript usage
- XHTML integration

## Cleanup

See [cleanup-debugging.md](references/cleanup-debugging.md) for:
- Resource cleanup patterns
- `ztoolkit.unregisterAll()` usage
- Common issues and debugging

## Template Cleanup

When starting from the zotero-plugin-template, delete:
- `src/modules/examples.ts`
- `src/modules/preferenceScript.ts` (unless using prefs)

Then clean up `hooks.ts`:
- Remove all `*ExampleFactory` imports
- Remove example factory method calls

Keep these utilities:
- `src/utils/ztoolkit.ts`
- `src/utils/locale.ts`
- `src/utils/prefs.ts` (optional)
