# Repository Map

## File Structure

```
src/
  index.ts          # Sandbox entry, addon instance
  addon.ts          # State container
  hooks.ts          # Lifecycle coordination
  modules/          # Feature implementations
    examples.ts
    preferenceScript.ts
  utils/            # Helpers
    locale.ts
    prefs.ts
    ztoolkit.ts
    window.ts

addon/
  bootstrap.js      # Bootstrap entry
  manifest.json     # Plugin metadata
  prefs.js          # Default preferences
  content/          # UI markup, CSS
  locale/           # Fluent strings
```

## Runtime Flow

1. Zotero loads `addon/bootstrap.js`
2. `startup()` injects the compiled bundle (`src/index.ts` → `.scaffold/build/...`)
3. `index.ts` creates `new Addon()` → stores at `Zotero[config.addonInstance]`
4. `bootstrap.js` calls `Zotero.__addonInstance__.hooks.onStartup()`
5. `hooks.ts` waits for Zotero ready, registers features
6. Per-window: `onMainWindowLoad()` for each window

## Key Locations

| Feature           | Location                                    |
| ----------------- | ------------------------------------------- |
| Menu registration | `src/modules/*.ts` → called from `hooks.ts` |
| Item columns      | `src/modules/*.ts`                          |
| Preference pane   | `src/modules/preferenceScript.ts`           |
| Locale strings    | `addon/locale/*/*.ftl`                      |
| Static assets     | `addon/content/*`                           |
| Pref defaults     | `addon/prefs.js`                            |

## Build Output

```
.scaffold/build/
  addon/
    content/scripts/${addonRef}.js  # Bundled code
    content/preferences.xhtml
    locale/
    manifest.json
  *.xpi
```
