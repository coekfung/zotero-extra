import { VenueAliasFactory } from "./modules/venueAlias";
import { initLocale } from "./utils/locale";

async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  initLocale();

  await Promise.all(
    Zotero.getMainWindows().map((win) => onMainWindowLoad(win)),
  );

  VenueAliasFactory.registerItemMenu();

  VenueAliasFactory.registerColumn();

  // Mark initialized as true to confirm plugin loading status
  // outside of the plugin (e.g. scaffold testing process)
  addon.data.initialized = true;
}

async function onMainWindowLoad(win: _ZoteroTypes.MainWindow): Promise<void> {
  win.MozXULElement.insertFTLIfNeeded(
    `${addon.data.config.addonRef}-addon.ftl`,
  );
}

async function onMainWindowUnload(_win: Window): Promise<void> {
  return;
}

function onShutdown(): void {
  VenueAliasFactory.unregisterItemMenu();
  VenueAliasFactory.unregisterColumn();
  ztoolkit.unregisterAll();
  // Remove addon object
  addon.data.alive = false;
  // @ts-expect-error - Plugin instance is not typed
  delete Zotero[addon.data.config.addonInstance];
}
async function onNotify(): Promise<void> {}

async function onPrefsEvent(): Promise<void> {}

function onShortcuts(): void {}

function onDialogEvents(type: string) {
  switch (type) {
    case "fetchVenueAlias":
      void VenueAliasFactory.fetchSelectedItems();
      break;
    default:
      break;
  }
}

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onNotify,
  onPrefsEvent,
  onShortcuts,
  onDialogEvents,
};
