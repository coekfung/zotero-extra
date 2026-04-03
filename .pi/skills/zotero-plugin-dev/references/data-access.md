# Data Access Quick Reference

## Selected Items

```typescript
const items = ZoteroPane.getSelectedItems();
const regularItems = items.filter((item) => item.isRegularItem());
```

## Item Fields

```typescript
// Read
const title = item.getField("title");
const extra = item.getField("extra");

// Write
item.setField("extra", "Key: Value");
await item.saveTx();
```

## Extra Field (Toolkit API)

```typescript
// Get single value
const value = ztoolkit.ExtraField.getExtraField(item, "Citation Key");

// Get all values for a key
const values = ztoolkit.ExtraField.getExtraField(item, "Tag", true);
// Returns: string[] | undefined

// Get all fields (enhanced mode)
const fields = ztoolkit.ExtraField.getExtraFields(item, "enhanced");
// Returns: Map<string, string[]>

// Get all fields (classical mode)
const fields = ztoolkit.ExtraField.getExtraFields(item, "classical");
// Returns: Map<string, string>

// Set value (auto-saves by default)
await ztoolkit.ExtraField.setExtraField(item, "Key", "value");

// Append to existing
await ztoolkit.ExtraField.setExtraField(item, "Tag", "new", { append: true });

// Set without saving
await ztoolkit.ExtraField.setExtraField(item, "Key", "value", { save: false });
await item.saveTx();

// Replace all fields
const fields = new Map<string, string[]>();
fields.set("Key", ["value"]);
await ztoolkit.ExtraField.replaceExtraFields(item, fields);
```

## Creators

```typescript
const creators = item.getCreators();
const firstCreator = item.firstCreator;

item.setCreators([
  { firstName: "John", lastName: "Smith", creatorType: "author" },
]);
await item.saveTx();
```

## Collections

```typescript
const collection = ZoteroPane.getSelectedCollection();
const items = collection?.getChildItems();

const collectionIDs = item.getCollections();
```

## Tags

```typescript
const tags = item.getTags();
item.addTag("new-tag");
item.removeTag("old-tag");
await item.saveTx();
```

## Annotations

```typescript
const annotations = item.getAnnotations();
for (const ann of annotations) {
  console.log(ann.annotationText);
  console.log(ann.annotationComment);
}
```

## Notifier Events

```typescript
const callback = {
  notify: async (event, type, ids, extraData) => {
    if (type === "item" && event === "add") {
      for (const id of ids) {
        const item = await Zotero.Items.getAsync(id);
        // Process
      }
    }
  },
};

const notifierID = Zotero.Notifier.registerObserver(callback, ["item"]);

// Cleanup
Zotero.Notifier.unregisterObserver(notifierID);
```

## Search

```typescript
const s = new Zotero.Search();
s.addCondition("title", "contains", "keyword");
s.addCondition("date", "isAfter", "2020");
s.addCondition("itemType", "isNot", "attachment");
const ids = await s.search();
const items = await Zotero.Items.getAsync(ids);
```

## HTTP Requests

```typescript
const response = await Zotero.HTTP.request("GET", "https://api.example.com", {
  headers: { Accept: "application/json" },
});
const data = JSON.parse(response.responseText);
```

## Reader (Toolkit)

```typescript
const reader = await ztoolkit.Reader.getReader();
if (reader) {
  const text = ztoolkit.Reader.getSelectedText(reader);
  const annotation = ztoolkit.Reader.getSelectedAnnotationData(reader);
}
```
