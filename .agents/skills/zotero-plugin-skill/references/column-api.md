# Column API

Item tree columns and item pane extensions.

## Item Tree Columns

```ts
Zotero.ItemTreeManager.registerColumn({
  pluginID: addon.data.config.addonID,
  columns: [
    {
      dataKey: "custom-rating",
      label: getString("column-rating"),
      pluginID: addon.data.config.addonID,
      dataProvider: (item, key) => item.getField("extra"),
      renderCell: (index, data, column) => {
        const span = document.createElement("span");
        span.textContent = "⭐".repeat(parseInt(data) || 0);
        return span;
      },
    },
  ],
});
```

### Column Properties

| Property       | Description                            |
| -------------- | -------------------------------------- |
| `dataKey`      | Unique column ID                       |
| `label`        | Header label                           |
| `dataProvider` | `(item, dataKey) => value`             |
| `renderCell`   | `(index, data, column) => HTMLElement` |
| `iconPath`     | Optional header icon                   |

## Item Pane Info Row

Add key-value row to Info tab:

```ts
Zotero.ItemPaneManager.registerInfoRow({
  pluginID: addon.data.config.addonID,
  rowID: "custom-doi",
  label: getString("row-doi"),
  position: "after",
  referenceID: "url",
  valueProvider: (item) => item.getField("DOI"),
});
```

## Item Pane Section

Add collapsible custom section:

```ts
Zotero.ItemPaneManager.registerSection({
  pluginID: addon.data.config.addonID,
  sectionID: "ai-summary",
  label: getString("section-ai"),
  onRender: ({ body, item, setL10nArgs }) => {
    body.innerHTML = `<p>${generateSummary(item)}</p>`;
  },
});
```

## Cleanup

```ts
// Remove all columns
Zotero.ItemTreeManager.unregisterColumn(addon.data.config.addonID);

// Remove specific section
Zotero.ItemPaneManager.unregisterSection("ai-summary");
```
