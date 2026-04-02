# Localization Quick Reference

## Fluent File (addon/locale/en-US/addon.ftl)

```fluent
# Simple string
my-message = Hello World

# With variable
my-count =
  { $count ->
    [one] 1 item
    *[other] { $count } items
  }

# With attribute
my-button = Click Me
  .tooltip = This is a tooltip
  .accesskey = C
```

## JavaScript Usage

```typescript
import { getString, getLocaleID } from "../utils/locale";

// Simple string
const text = getString("my-message");

// With variable
const count = getString("my-count", { args: { count: 5 } });

// With attribute (branch)
const tooltip = getString("my-button", { branch: "tooltip" });

// Get locale ID for MenuManager
const menuL10nID = getLocaleID("menu-label");
// Returns: "addonRef-menu-label"
```

## Loading in Window

```typescript
async function onMainWindowLoad(win: _ZoteroTypes.MainWindow) {
  win.MozXULElement.insertFTLIfNeeded(`${addon.data.config.addonRef}-addon.ftl`);
}
```

## XHTML Usage

```xml
<vbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
      xmlns:html="http://www.w3.org/1999/xhtml">
  <label data-l10n-id="my-message" />
  <checkbox data-l10n-id="my-checkbox"
            preference="extensions.zotero.addonRef.enabled" />
</vbox>
```
