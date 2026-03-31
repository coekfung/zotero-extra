import { getString, getLocaleID } from "../utils/locale";
import { ExtraFieldTool } from "zotero-plugin-toolkit";

const CROSSREF_API_URL = "https://api.crossref.org/works/";
const VENUE_ALIAS_KEY = "Venue Alias";
const VENUE_ALIAS_COLUMN_KEY = "venueAlias";
const extraFieldTool = new ExtraFieldTool();

export enum VenueAliasResult {
  MissingDOI = "missingDOI",
  NotFound = "notFound",
  AlreadyUpToDate = "alreadyUpToDate",
  Updated = "updated",
  RequestFailed = "requestFailed",
}

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const status = "status" in error ? error.status : undefined;
  if (typeof status === "number") {
    return status;
  }

  const xmlhttp = "xmlhttp" in error ? error.xmlhttp : undefined;
  if (
    xmlhttp &&
    typeof xmlhttp === "object" &&
    "status" in xmlhttp &&
    typeof xmlhttp.status === "number"
  ) {
    return xmlhttp.status;
  }

  return undefined;
}

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

export function getVenueAlias(item: Zotero.Item): string | undefined {
  const alias = extraFieldTool.getExtraField(item, VENUE_ALIAS_KEY);
  return alias ? normalizeVenueAlias(alias) : undefined;
}

async function updateVenueAliasForItem(
  item: Zotero.Item,
): Promise<VenueAliasResult> {
  const doi = item.getField("DOI").trim();
  if (!doi) {
    return VenueAliasResult.MissingDOI;
  }

  let nextAlias: string | undefined;
  try {
    nextAlias = await fetchCrossrefVenueAlias(doi);
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      return VenueAliasResult.NotFound;
    }
    throw error;
  }

  if (!nextAlias) {
    return VenueAliasResult.NotFound;
  }

  const normalizedAlias = normalizeVenueAlias(nextAlias);
  if (!normalizedAlias) {
    return VenueAliasResult.NotFound;
  }

  const currentAlias = getVenueAlias(item);
  if (currentAlias === normalizedAlias) {
    return VenueAliasResult.AlreadyUpToDate;
  }

  await extraFieldTool.setExtraField(item, VENUE_ALIAS_KEY, normalizedAlias, {
    append: false,
  });
  return VenueAliasResult.Updated;
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

export interface VenueAliasCounts {
  [VenueAliasResult.MissingDOI]: number;
  [VenueAliasResult.NotFound]: number;
  [VenueAliasResult.AlreadyUpToDate]: number;
  [VenueAliasResult.Updated]: number;
  [VenueAliasResult.RequestFailed]: number;
}

export function getSummaryEntries(
  counts: VenueAliasCounts,
): Array<[VenueAliasResult, number]> {
  const entries: Array<[VenueAliasResult, number]> = [];

  if (counts[VenueAliasResult.Updated] > 0) {
    entries.push([VenueAliasResult.Updated, counts[VenueAliasResult.Updated]]);
  }

  if (counts[VenueAliasResult.AlreadyUpToDate] > 0) {
    entries.push([
      VenueAliasResult.AlreadyUpToDate,
      counts[VenueAliasResult.AlreadyUpToDate],
    ]);
  }

  if (counts[VenueAliasResult.MissingDOI] > 0) {
    entries.push([
      VenueAliasResult.MissingDOI,
      counts[VenueAliasResult.MissingDOI],
    ]);
  }

  if (counts[VenueAliasResult.NotFound] > 0) {
    entries.push([
      VenueAliasResult.NotFound,
      counts[VenueAliasResult.NotFound],
    ]);
  }

  if (counts[VenueAliasResult.RequestFailed] > 0) {
    entries.push([
      VenueAliasResult.RequestFailed,
      counts[VenueAliasResult.RequestFailed],
    ]);
  }

  return entries;
}

export function createEmptyVenueAliasCounts(): VenueAliasCounts {
  return {
    [VenueAliasResult.MissingDOI]: 0,
    [VenueAliasResult.NotFound]: 0,
    [VenueAliasResult.AlreadyUpToDate]: 0,
    [VenueAliasResult.Updated]: 0,
    [VenueAliasResult.RequestFailed]: 0,
  };
}

export function buildSummaryString(
  counts: VenueAliasCounts,
  total: number,
): string {
  const parts = getSummaryEntries(counts).map(([result, count]) => {
    switch (result) {
      case VenueAliasResult.Updated:
        return getString("venue-alias-summary-updated", { args: { count } });
      case VenueAliasResult.AlreadyUpToDate:
        return getString("venue-alias-summary-uptodate", { args: { count } });
      case VenueAliasResult.MissingDOI:
        return getString("venue-alias-summary-missing-doi", {
          args: { count },
        });
      case VenueAliasResult.NotFound:
        return getString("venue-alias-summary-not-found", { args: { count } });
      case VenueAliasResult.RequestFailed:
        return getString("venue-alias-summary-failed", { args: { count } });
    }
  });

  if (parts.length === 0) {
    return getString("venue-alias-no-update");
  }

  // For single item, show concise outcome
  if (total === 1) {
    return parts[0]!;
  }

  // For multiple items, join with comma
  return parts.join(", ");
}

export class VenueAliasFactory {
  static async registerColumn() {
    await Zotero.ItemTreeManager.registerColumns({
      pluginID: addon.data.config.addonID,
      dataKey: VENUE_ALIAS_COLUMN_KEY,
      label: getString("venue-alias-column-label"),
      dataProvider: (item: Zotero.Item) => getVenueAlias(item) ?? "",
    });
  }

  static unregisterColumn() {
    Zotero.ItemTreeManager.unregisterColumns(addon.data.config.addonID);
  }

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

    const counts = createEmptyVenueAliasCounts();

    for (const item of items) {
      try {
        const result = await updateVenueAliasForItem(item);
        counts[result]++;
      } catch (error) {
        counts[VenueAliasResult.RequestFailed]++;
        ztoolkit.log("Failed to fetch venue alias", item.id, error);
      }
    }

    const summary = buildSummaryString(counts, items.length);
    const type =
      counts[VenueAliasResult.Updated] > 0
        ? "success"
        : counts[VenueAliasResult.RequestFailed] > 0
          ? "fail"
          : "default";
    showResultWindow(summary, type);
  }
}
