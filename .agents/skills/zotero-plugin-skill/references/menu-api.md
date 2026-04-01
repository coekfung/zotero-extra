# Menu API

Menu registration via `Zotero.MenuManager`.

## Registration

```ts
Zotero.MenuManager.registerMenu({
  pluginID: addon.data.config.addonID,
  menuID: "my-context-menu",
  target: "main/library/item",
  menus: [
    {
      menuType: "menuitem",
      l10nID: getLocaleID("menu-action"),
      onCommand: (ev, context) => {
        const items = context.items;
        processItems(items);
      },
    },
    { menuType: "separator" },
    {
      menuType: "submenu",
      l10nID: getLocaleID("menu-more"),
      menus: [
        {
          menuType: "menuitem",
          l10nID: getLocaleID("menu-sub"),
          onCommand: handleSub,
        },
      ],
    },
  ],
});
```

## Targets

| Target                    | Location                |
| ------------------------- | ----------------------- |
| `main/library/item`       | Item context menu       |
| `main/library/collection` | Collection context menu |
| `main/menubar/file`       | File menu               |
| `main/menubar/edit`       | Edit menu               |
| `main/menubar/view`       | View menu               |
| `main/tab`                | Tab context menu        |
| `reader/menubar/file`     | Reader File menu        |
| `itemPane/info/row`       | Item pane field menu    |

## Descriptor Fields

| Field       | Description                              |
| ----------- | ---------------------------------------- |
| `menuType`  | `menuitem`, `separator`, `submenu`       |
| `l10nID`    | Fluent localization ID (recommended)     |
| `icon`      | Icon path                                |
| `onCommand` | Click handler `(event, context) => void` |
| `onShowing` | Before show `(context) => void`          |

## Context Object

Available in callbacks:

```ts
onShowing: (ctx) => {
  ctx.setVisible(ctx.items?.length > 0);
  ctx.setEnabled(!isLocked);
};
```

- `setVisible(boolean)` - Show/hide
- `setEnabled(boolean)` - Enable/disable
- `items` - Selected items (library menus)
- `fieldName` - Field name (item pane menus)

## Localization

Define in `addon/locale/*/mainWindow.ftl`:

```ftl
menu-action =
    .label = Do Something
```

## Cleanup

Auto-cleaned on plugin unload. Manual:

```ts
Zotero.MenuManager.unregisterMenu("my-context-menu");
```
