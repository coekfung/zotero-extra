# API Reference Index

Quick reference for Zotero plugin APIs.

## Core Zotero APIs

| API                      | Purpose             | Doc                                  |
| ------------------------ | ------------------- | ------------------------------------ |
| `Zotero.MenuManager`     | Menus               | [menu-api.md](menu-api.md)           |
| `Zotero.ItemTreeManager` | Columns             | [column-api.md](column-api.md)       |
| `Zotero.ItemPaneManager` | Info rows, sections | [column-api.md](column-api.md)       |
| `Zotero.Notifier`        | Event observation   | [lifecycle-api.md](lifecycle-api.md) |
| `Zotero.PreferencePanes` | Settings UI         | [lifecycle-api.md](lifecycle-api.md) |

## Toolkit APIs

| API                         | Purpose          | Doc                    |
| --------------------------- | ---------------- | ---------------------- |
| `ztoolkit.ProgressWindow`   | Notifications    | [ui-api.md](ui-api.md) |
| `ztoolkit.Dialog`           | Modal dialogs    | [ui-api.md](ui-api.md) |
| `ztoolkit.Prompt`           | Command palette  | [ui-api.md](ui-api.md) |
| `ztoolkit.UI.createElement` | Element creation | [ui-api.md](ui-api.md) |
| `ztoolkit.Keyboard`         | Shortcuts        | [ui-api.md](ui-api.md) |

## Key Patterns

**Startup Gating:**

```ts
await Promise.all([
  Zotero.initializationPromise,
  Zotero.unlockPromise,
  Zotero.uiReadyPromise,
]);
```

**Cleanup:**

```ts
ztoolkit.unregisterAll();
Zotero.Notifier.unregisterObserver(id);
```

**Config Access:**

```ts
const { addonID, addonRef, prefsPrefix } = addon.data.config;
```
