import { getString, getLocaleID } from "../utils/locale";
import { ExtraFieldTool } from "zotero-plugin-toolkit";

const CROSSREF_API_URL = "https://api.crossref.org/works/";
const VENUE_ALIAS_KEY = "Venue Alias";
const extraFieldTool = new ExtraFieldTool();

interface CrossrefWorkMessage {
  "short-container-title"?: unknown;
}

interface CrossrefWorkResponse {
  message?: CrossrefWorkMessage;
}

async function fetchCrossrefVenueAlias(
  doi: string,
): Promise<string | undefined> {
  const response = await Zotero.HTTP.request(
    "GET",
    `${CROSSREF_API_URL}${encodeURIComponent(doi)}`,
  );
  const payload = JSON.parse(
    response.responseText ?? "{}",
  ) as CrossrefWorkResponse;
  return extractVenueAliasFromCrossref(payload);
}

export function extractVenueAliasFromCrossref(
  payload: CrossrefWorkResponse,
): string | undefined {
  const shortContainerTitle = payload.message?.["short-container-title"];
  if (!Array.isArray(shortContainerTitle)) {
    return undefined;
  }

  return shortContainerTitle
    .find(
      (value): value is string => typeof value === "string" && !!value.trim(),
    )
    ?.trim();
}

export function normalizeVenueAlias(alias: string): string | undefined {
  const normalizedAlias = alias.replace(/\r?\n+/g, " ").trim();
  return normalizedAlias || undefined;
}

async function updateVenueAliasForItem(item: Zotero.Item): Promise<boolean> {
  const doi = item.getField("DOI").trim();
  if (!doi) {
    return false;
  }

  const nextAlias = await fetchCrossrefVenueAlias(doi);
  if (!nextAlias) {
    return false;
  }

  const normalizedAlias = normalizeVenueAlias(nextAlias);
  if (!normalizedAlias) {
    return false;
  }

  const currentAlias = extraFieldTool.getExtraField(item, VENUE_ALIAS_KEY);
  if (currentAlias === normalizedAlias) {
    return false;
  }

  await extraFieldTool.setExtraField(item, VENUE_ALIAS_KEY, normalizedAlias, {
    append: false,
  });
  return true;
}

function getSelectedRegularItems(): Zotero.Item[] {
  return ztoolkit
    .getGlobal("ZoteroPane")
    .getSelectedItems()
    .filter((item): item is Zotero.Item => item.isRegularItem());
}

function showResultWindow(text: string, type: "default" | "success" | "fail") {
  new ztoolkit.ProgressWindow(addon.data.config.addonName, {
    closeOnClick: true,
    closeTime: 5000,
  })
    .createLine({ text, type })
    .show();
}

export class VenueAliasFactory {
  static registerItemMenu() {
    Zotero.MenuManager.registerMenu({
      pluginID: addon.data.config.addonID,
      menuID: "fetch-venue-alias",
      target: "main/library/item",
      menus: [
        {
          menuType: "menuitem",
          l10nID: getLocaleID("venue-alias-menuitem"),
          onCommand: () => addon.hooks.onDialogEvents("fetchVenueAlias"),
        },
      ],
    });
  }

  static async fetchSelectedItems() {
    const items = getSelectedRegularItems();
    if (!items.length) {
      showResultWindow(getString("venue-alias-no-items"), "fail");
      return;
    }

    let updated = 0;

    for (const item of items) {
      try {
        if (await updateVenueAliasForItem(item)) {
          updated += 1;
        }
      } catch (error) {
        ztoolkit.log("Failed to fetch venue alias", item.id, error);
      }
    }

    if (updated > 0) {
      showResultWindow(
        getString("venue-alias-updated", { args: { count: updated } }),
        "success",
      );
      return;
    }

    showResultWindow(getString("venue-alias-no-update"), "default");
  }
}
