# Adding Features Quick Reference

## Feature Template

```typescript
// src/modules/myFeature.ts
import { addon } from "../addon";
import { getLocaleID } from "../utils/locale";

class MyFeature {
  private notifierID: string | null = null;
  private menuID: string | null = null;

  async init() {
    this.registerNotifier();
    // Other initialization
  }

  async initWindow(win: _ZoteroTypes.MainWindow) {
    this.menuID = this.registerMenu();
  }

  cleanup() {
    if (this.notifierID) {
      Zotero.Notifier.unregisterObserver(this.notifierID);
      this.notifierID = null;
    }
    if (this.menuID) {
      Zotero.MenuManager.unregisterMenu(this.menuID);
      this.menuID = null;
    }
  }

  private registerNotifier() {
    const callback = {
      notify: async (event: string, type: string, ids: number[]) => {
        if (type === "item" && event === "add") {
          await this.handleNewItems(ids);
        }
      },
    };
    this.notifierID = Zotero.Notifier.registerObserver(callback, ["item"]);
  }

  private registerMenu(): string | null {
    return Zotero.MenuManager.registerMenu({
      menuID: `${addon.data.config.addonRef}-menu`,
      pluginID: addon.data.config.addonID,
      target: "main/library/item",
      menus: [
        {
          menuType: "menuitem",
          l10nID: getLocaleID("menu-label"),
          onCommand: () => this.handleMenuClick(),
        },
      ],
    });
  }

  private async handleNewItems(ids: number[]) {
    // Process new items
  }

  private handleMenuClick() {
    const items = ZoteroPane.getSelectedItems();
    // Process selected items
  }
}

export const myFeature = new MyFeature();
```

## Wire Up in hooks.ts

```typescript
import { myFeature } from "./modules/myFeature";
import { addon } from "./addon";
import { initLocale } from "./utils/locale";
import { createZToolkit } from "./utils/ztoolkit";

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
  await myFeature.initWindow(win);
}

function onShutdown() {
  myFeature.cleanup();
  ztoolkit.unregisterAll();
}
```

Notes:

- `MenuManager`, `ItemPaneManager`, and `PreferencePanes` support `pluginID`-based cleanup. Still clean up module-owned resources such as notifiers, plugin observers, timers, and window listeners.
- Prefer storing unregister callbacks or returned IDs in the feature module rather than scattering cleanup across hooks.
- Treat scaffold example code as a starting point. Prefer current non-deprecated APIs and remove demo-only behavior early.

## Cleanup Pattern

```typescript
class MyFeature {
  private resources: Array<() => void> = [];

  registerSomething() {
    const id = Zotero.Notifier.registerObserver(callback, ["item"]);
    this.resources.push(() => Zotero.Notifier.unregisterObserver(id));
  }

  registerWindow(win: Window) {
    const onResize = () => {
      // Handle resize
    };
    win.addEventListener("resize", onResize);
    this.resources.push(() => win.removeEventListener("resize", onResize));
  }

  cleanup() {
    this.resources.forEach((fn) => fn());
    this.resources = [];
  }
}
```

## Preferences

```typescript
async function onStartup() {
  // ... other init ...
  Zotero.PreferencePanes.register({
    pluginID: addon.data.config.addonID,
    src: rootURI + "content/preferences.xhtml",
    label: getString("prefs-title"),
    image: `chrome://${addon.data.config.addonRef}/content/icons/favicon.png`,
  });
}
```
