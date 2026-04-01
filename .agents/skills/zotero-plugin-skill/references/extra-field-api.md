# Extra Field API

## Working with Item `extra`

- Prefer `ExtraFieldTool` from `zotero-plugin-toolkit` over manual string parsing when reading or writing structured lines in an item's `extra` field.
- `ExtraFieldTool` handles parsing and serialization of `key: value` lines, preserves non-standard lines, and can save through `item.saveTx()` for you.
- Use the default `"enhanced"` parser when duplicate keys matter; use `"classical"` only when you specifically want Zotero's single-value behavior.
- Setting a field to `""` or `undefined` removes that key.
- Pass `{ save: false }` when batching multiple item mutations so you can control `saveTx()` yourself.

```ts
import { ExtraFieldTool } from "zotero-plugin-toolkit";

const extraTool = new ExtraFieldTool();

const alias = extraTool.getExtraField(item, "Venue Alias");
await extraTool.setExtraField(item, "Venue Alias", "NeurIPS");
await extraTool.setExtraField(item, "Venue Alias", undefined);
```

## Notes

- `getExtraFields(item, "enhanced")` returns `Map<string, string[]>` and preserves duplicate keys.
- `getExtraField(item, key, true)` returns all values for a key.
- `replaceExtraFields()` can rewrite the whole field map, but use it carefully and preserve `__nonStandard__` content unless you intentionally want to drop free-form lines.
