# Architecture Quick Reference

## Project Structure

```
src/
├── index.ts          # Entry point - initializes addon, defines globals
├── addon.ts          # Addon class - data store, lifecycle hooks
├── hooks.ts          # Lifecycle handlers
├── modules/          # Your feature modules
└── utils/
    ├── ztoolkit.ts   # Toolkit initialization
    ├── locale.ts     # Localization helpers
    ├── prefs.ts      # Preference utilities
    └── window.ts     # Window utilities
```

## Core Files

### addon.ts

```typescript
class Addon {
  public data: {
    alive: boolean;
    config: typeof config;
    env: "development" | "production";
    initialized?: boolean;
    ztoolkit: ZToolkit;
    // Add your own properties here
    myFeatureState?: { enabled: boolean; lastItemID?: number };
  };
  public hooks: typeof hooks;
  public api: object;
}
```

### hooks.ts

```typescript
async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);
  initLocale();
  await myFeature.init();
  addon.data.initialized = true;
}

async function onMainWindowLoad(win: _ZoteroTypes.MainWindow) {
  addon.data.ztoolkit = createZToolkit();
  win.MozXULElement.insertFTLIfNeeded(
    `${addon.data.config.addonRef}-addon.ftl`,
  );
}

async function onMainWindowUnload(win: Window) {
  ztoolkit.unregisterAll();
}

function onShutdown() {
  myFeature.cleanup();
  ztoolkit.unregisterAll();
  addon.data.alive = false;
  delete Zotero[addon.data.config.addonInstance];
}

async function onNotify(event, type, ids, extraData) {
  // Handle notifications
}
```

## Utilities

### utils/ztoolkit.ts

```typescript
import { ZoteroToolkit } from "zotero-plugin-toolkit";
import { config } from "../../package.json";

export function createZToolkit() {
  const toolkit = new ZoteroToolkit();
  toolkit.basicOptions.log.prefix = `[${config.addonName}]`;
  toolkit.basicOptions.log.disableConsole = __env__ === "production";
  toolkit.basicOptions.api.pluginID = config.addonID;
  toolkit.ProgressWindow.setIconURI(
    "default",
    `chrome://${config.addonRef}/content/icons/favicon.png`,
  );
  return toolkit;
}
```

### utils/locale.ts

```typescript
import { config } from "../../package.json";

export function initLocale() {
  const l10n = new (
    typeof Localization === "undefined"
      ? ztoolkit.getGlobal("Localization")
      : Localization
  )([`${config.addonRef}-addon.ftl`], true);
  addon.data.locale = { current: l10n };
}

export function getString(
  id: string,
  options?: { args?: Record<string, string | number>; branch?: string },
): string {
  // Implementation
}

export function getLocaleID(id: string) {
  return `${config.addonRef}-${id}`;
}
```

### utils/prefs.ts

```typescript
import { config } from "../../package.json";

const prefsPrefix = config.prefsPrefix;

export function getPref(key: string) {
  return Zotero.Prefs.get(`${prefsPrefix}.${key}`, true);
}

export function setPref(key: string, value: string | number | boolean) {
  Zotero.Prefs.set(`${prefsPrefix}.${key}`, value, true);
}
```

## package.json Config

```json
{
  "config": {
    "addonName": "My Plugin",
    "addonID": "myplugin@example.com",
    "addonRef": "myplugin",
    "addonInstance": "MyPlugin",
    "prefsPrefix": "extensions.zotero.myplugin"
  }
}
```

Access: `config.addonName`, `config.addonID`, etc.
