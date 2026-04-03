# Cleanup & Debugging Quick Reference

## Cleanup Pattern

```typescript
class MyFeature {
  private resources: Array<() => void> = [];

  registerMenu() {
    const menuID = Zotero.MenuManager.registerMenu({...});
    this.resources.push(() => Zotero.MenuManager.unregisterMenu(menuID));
  }

  registerNotifier() {
    const id = Zotero.Notifier.registerObserver(callback, ["item"]);
    this.resources.push(() => Zotero.Notifier.unregisterObserver(id));
  }

  cleanup() {
    this.resources.forEach(fn => fn());
    this.resources = [];
  }
}
```

## Global Cleanup

```typescript
function onShutdown() {
  myFeature.cleanup();
  ztoolkit.unregisterAll(); // Cleans up toolkit-managed registrations and elements
  addon.data.alive = false;
  delete Zotero[addon.data.config.addonInstance];
}
```

## What Must Be Cleaned Up Explicitly

Clean up resources your module owns, especially:

- `Zotero.Notifier` observers
- `Zotero.Plugins.addObserver` handlers
- timers and deferred work
- window or DOM event listeners
- module state that should not survive reloads

Registrations created with a `pluginID` such as `MenuManager`, `ItemPaneManager`, and `PreferencePanes` are removed automatically when the plugin is disabled or unloaded. Keep explicit cleanup for anything outside that lifecycle or anything you may re-register during runtime.

## Logging

```typescript
ztoolkit.log("message", data);
// Output: [AddonName] message { data }
```

## Build Commands

```bash
npm run build        # Build plugin
npm run lint:check   # Check code style
npm run lint:fix     # Fix code style
npm test             # Run tests
```

If the project has its own workflow constraints, follow those instead of scaffold defaults.

## Common Issues

| Issue               | Solution                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Plugin not loading  | Check `addon.data.initialized = true` is set                                                           |
| UI not appearing    | Verify `pluginID` matches config                                                                       |
| Cleanup not working | Verify which APIs auto-clean via `pluginID` and explicitly unregister observers, listeners, and timers |
| Type errors         | Run `npm run build` to regenerate types                                                                |

## Debug Checklist

1. Check Zotero browser console for errors
2. Verify `.env` file has correct Zotero path
3. Ensure Fluent file is loaded with `insertFTLIfNeeded`
4. Confirm plugin enabled in Tools > Plugins
