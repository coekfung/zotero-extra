# UI Patterns Quick Reference

## Item Tree Column

```typescript
Zotero.ItemTreeManager.registerColumn({
  pluginID: addon.data.config.addonID,
  dataKey: "myColumn",
  label: "My Column",
  dataProvider: (item) => item.getField("extra"),
  iconPath: "chrome://zotero/skin/cross.png",
  renderCell(index, data, column, isFirstColumn, doc) {
    const span = doc.createElement("span");
    span.className = `cell ${column.className}`;
    span.textContent = data;
    return span;
  },
});
```

## Item Pane Section

```typescript
Zotero.ItemPaneManager.registerSection({
  paneID: "my-section",
  pluginID: addon.data.config.addonID,
  header: {
    l10nID: getLocaleID("section-header"),
    icon: "chrome://zotero/skin/16/universal/book.svg",
  },
  sidenav: {
    l10nID: getLocaleID("section-sidenav"),
    icon: "chrome://zotero/skin/20/universal/save.svg",
  },
  onRender: ({ body, item, editable, tabType }) => {
    body.textContent = item?.getField("title") || "";
  },
  onAsyncRender: async ({ body, item, setL10nArgs, setSectionSummary }) => {
    const data = await fetchData(item);
    body.textContent = data;
    setL10nArgs(`{ "status": "loaded" }`);
    setSectionSummary(data.substring(0, 50));
  },
});
```

## Reader Section

```typescript
Zotero.ItemPaneManager.registerSection({
  paneID: "reader-section",
  pluginID: addon.data.config.addonID,
  header: { l10nID: getLocaleID("reader-header") },
  onItemChange: ({ item, setEnabled, tabType }) => {
    setEnabled(tabType === "reader");
    return true;
  },
  onRender: ({ body, item }) => {
    body.textContent = "Loading...";
  },
  onAsyncRender: async ({ body, item }) => {
    body.textContent = item?.getAnnotations().length + " annotations";
  },
});
```

## Context Menu

```typescript
const menuID = Zotero.MenuManager.registerMenu({
  menuID: `${addon.data.config.addonRef}-menu`,
  pluginID: addon.data.config.addonID,
  target: "main/library/item",
  menus: [
    {
      menuType: "menuitem",
      l10nID: getLocaleID("menu-label"),
      icon: `chrome://${addon.data.config.addonRef}/content/icons/icon.png`,
      onCommand: () => {
        const items = ZoteroPane.getSelectedItems();
        // Process
      },
    },
  ],
});
```

## Window Menu

```typescript
// File menu
const menuID = Zotero.MenuManager.registerMenu({
  menuID: `${addon.data.config.addonRef}-file-menu`,
  pluginID: addon.data.config.addonID,
  target: "main/menubar/file",
  menus: [
    { menuType: "separator" },
    {
      menuType: "menuitem",
      l10nID: getLocaleID("file-menu"),
      onCommand: () => {},
    },
  ],
});

// Tools menu
Zotero.MenuManager.registerMenu({
  menuID: `${addon.data.config.addonRef}-tools-menu`,
  pluginID: addon.data.config.addonID,
  target: "main/menubar/tools",
  menus: [
    {
      menuType: "menuitem",
      l10nID: getLocaleID("tools-menu"),
      onCommand: () => {},
    },
  ],
});
```

## Keyboard Shortcuts

```typescript
ztoolkit.Keyboard.register((ev, keyOptions) => {
  if (keyOptions.keyboard?.equals("shift,alt,m")) {
    ev.preventDefault();
    // Handle
  }
});
```

## Progress Window

```typescript
const progress = new ztoolkit.ProgressWindow(addon.data.config.addonName, {
  closeOnClick: true,
  closeTime: -1,
})
  .createLine({ text: "Loading...", type: "default", progress: 0 })
  .show();

progress.changeLine({ text: "Halfway", progress: 50 });
progress.startCloseTimer(3000);
```

## Dialog

```typescript
const dialogData: { [key: string]: any } = {
  inputValue: "",
  unloadLock: Zotero.Promise.defer(),
};

new ztoolkit.Dialog(3, 2)
  .addCell(0, 0, { tag: "h1", properties: { innerText: "Title" } })
  .addCell(1, 0, {
    tag: "input",
    namespace: "html",
    attributes: { type: "text", "data-bind": "inputValue" },
  })
  .addButton("OK", "ok")
  .addButton("Cancel", "cancel")
  .setDialogData(dialogData)
  .open("Dialog");

await dialogData.unloadLock.promise;
const value = dialogData.inputValue;
```

## File Picker

```typescript
const path = await new ztoolkit.FilePicker(
  "Import File",
  "open",
  [
    ["PNG", "*.png"],
    ["All", "*.*"],
  ],
  "image.png",
).open();
```

## Clipboard

```typescript
new ztoolkit.Clipboard()
  .addText("plain", "text/unicode")
  .addText("<b>html</b>", "text/html")
  .copy();
```

## Virtualized Table (Preferences)

```typescript
const tableHelper = new ztoolkit.VirtualizedTable(win)
  .setContainerId(`${config.addonRef}-table`)
  .setProp({
    id: `${config.addonRef}-prefs-table`,
    columns: [
      { dataKey: "name", label: "Name" },
      { dataKey: "value", label: "Value" },
    ],
    showHeader: true,
  })
  .setProp("getRowCount", () => rows.length)
  .setProp("getRowData", (index) => rows[index])
  .render();
```
