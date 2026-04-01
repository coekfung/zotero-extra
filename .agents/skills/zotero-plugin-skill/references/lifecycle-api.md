# Lifecycle API Reference

Lifecycle management, event notifications, and preference handling.

## Hooks (`src/hooks.ts`)

Called by the bootstrap process.

### `onStartup()`

Global initialization. Runs once when plugin enabled/Zotero starts.

```ts
export async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);
  initializePlugin();
}
```

### `onShutdown()`

Global cleanup. Runs on disable/uninstall/Zotero close.

```ts
export function onShutdown() {
  Zotero.Notifier.unregisterObserver(notifierID);
  ztoolkit.unregisterAll();
}
```

### `onMainWindowLoad(window)`

Per-window setup. Runs for every main window.

```ts
export function onMainWindowLoad(win: Window) {
  createUI(win);
}
```

### `onMainWindowUnload(window)`

Per-window cleanup.

```ts
export function onMainWindowUnload(win: Window) {
  removeUI(win);
}
```

### Specialized Hooks

- `onNotify(event, type, ids, extraData)` - Zotero data events
- `onPrefsEvent(type, data)` - Preference pane events
- `onShortcuts(type, data)` - Keyboard shortcuts

## Notifiers

Observe Zotero data changes.

```ts
const notifierID = Zotero.Notifier.registerObserver(
  {
    notify: (event, type, ids) => {
      if (type === "item" && event === "add") {
        handleNewItems(ids);
      }
    },
  },
  ["item", "collection"],
  "myPlugin",
);

// Cleanup
Zotero.Notifier.unregisterObserver(notifierID);
```

## Preferences

### Programmatic Access

```ts
const prefix = addon.data.config.prefsPrefix;

const value = Zotero.Prefs.get(`${prefix}.enable`);
Zotero.Prefs.set(`${prefix}.enable`, true);
```

### Preference Pane

```ts
Zotero.PreferencePanes.register({
  pluginID: addon.data.config.addonID,
  src: `${rootURI}content/preferences.xhtml`,
  label: getString("prefs-title"),
  image: `${rootURI}content/icons/icon.png`,
});
```

## Cleanup Checklist

- `ztoolkit.unregisterAll()` - Toolkit UI elements
- `Zotero.Notifier.unregisterObserver(id)` - Observers
- Close plugin-owned dialogs
- Remove event listeners
