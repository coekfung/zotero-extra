# UI API

Toolkit utilities for dialogs, notifications, and elements.

## ProgressWindow

Toast notifications in bottom-right:

```ts
const pw = new ztoolkit.ProgressWindow(addonName)
  .createLine({ text: "Processing...", type: "default" })
  .show();

pw.changeLine({ text: "Done!", type: "success" });
pw.startCloseTimer(3000);
```

Types: `default`, `success`, `warning`, `error`

## Dialog

Modal dialog with data binding:

```ts
const data = { value: "initial" };

new ztoolkit.Dialog(3, 1)
  .addCell(0, 0, { tag: "h3", properties: { textContent: "Title" } })
  .addCell(1, 0, {
    tag: "input",
    namespace: "html",
    attributes: { "data-bind": "value", type: "text" },
  })
  .addButton("OK", "ok")
  .setDialogData(data)
  .open("Dialog Title");
```

## Prompt

Command palette (Shift+P style):

```ts
ztoolkit.Prompt.register({
  name: "My Command",
  label: "Plugin Actions",
  callback: () => doAction(),
  when: () => getSelectedItems().length > 0,
});
```

## Clipboard

```ts
new ztoolkit.Clipboard().addText("plain", "text/unicode").copy();
```

## FilePicker

```ts
const picker = new ztoolkit.FilePicker();
picker.init(win, "Select File", picker.modeOpen);
picker.appendFilters([["PDF", "*.pdf"]]);
const path = await picker.open();
```

## createElement

```ts
const el = ztoolkit.UI.createElement(doc, "div", {
  properties: { textContent: "Hello" },
  styles: { padding: "10px" },
});
```

## Keyboard

```ts
ztoolkit.Keyboard.register({
  id: `${config.addonRef}-shortcut`,
  key: "L",
  modifiers: "accel shift",
  callback: handleShortcut,
});
```
