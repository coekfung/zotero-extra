import { getString, getLocaleID } from "../utils/locale";
import {
  updateItemConferenceName,
  type UpdateResult,
} from "../utils/semanticScholar";
import { isConferencePaper } from "../utils/common";

/**
 * Show progress notification for batch operations
 */
function showProgress(
  message: string,
  type: "default" | "success" | "error" = "default",
): void {
  new ztoolkit.ProgressWindow(addon.data.config.addonName, {
    closeOnClick: true,
    closeTime: 3000,
  })
    .createLine({
      text: message,
      type,
      progress: 100,
    })
    .show();
}

/**
 * Handle the context menu command to fetch short conference names
 * Processes all selected conference papers with DOIs
 */
export async function handleFetchConferenceName(
  items: Zotero.Item[],
): Promise<void> {
  const regularItems = items.filter((item) => item.isRegularItem());

  if (regularItems.length === 0) {
    showProgress(getString("semantic-scholar-no-selection"), "error");
    return;
  }

  const conferencePapers = regularItems.filter(isConferencePaper);

  if (conferencePapers.length === 0) {
    showProgress(getString("semantic-scholar-no-conference-papers"), "error");
    return;
  }

  const papersWithDoi = conferencePapers.filter((item) => item.getField("DOI"));

  if (papersWithDoi.length === 0) {
    showProgress(getString("semantic-scholar-no-dois"), "error");
    return;
  }

  const progress = new ztoolkit.ProgressWindow(addon.data.config.addonName, {
    closeOnClick: false,
    closeTime: -1,
  });

  progress
    .createLine({
      text: getString("semantic-scholar-fetching", {
        args: { count: papersWithDoi.length },
      }),
      type: "default",
      progress: 0,
    })
    .show();

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  const errorCounts = new Map<string, number>();

  for (let i = 0; i < papersWithDoi.length; i++) {
    const item = papersWithDoi[i];
    const percent = Math.round(((i + 1) / papersWithDoi.length) * 100);

    try {
      const result: UpdateResult = await updateItemConferenceName(item);
      if (result === "updated") {
        successCount++;
      } else {
        skipCount++;
      }
    } catch (error) {
      failCount++;
      const errorText = error instanceof Error ? error.message : String(error);
      errorCounts.set(errorText, (errorCounts.get(errorText) || 0) + 1);
    }

    progress.changeLine({
      text: getString("semantic-scholar-fetching", {
        args: { count: papersWithDoi.length },
      }),
      progress: percent,
    });
  }

  progress.startCloseTimer(3000);

  if (failCount === 0 && skipCount === 0) {
    showProgress(
      getString("semantic-scholar-success", {
        args: { count: successCount },
      }),
      "success",
    );
  } else if (failCount === 0) {
    showProgress(
      getString("semantic-scholar-success-skip", {
        args: {
          count: successCount,
          skip: skipCount,
        },
      }),
      "success",
    );
  } else if (successCount === 0 && skipCount === 0) {
    const errorSummary = Array.from(errorCounts.entries())
      .map(([msg, count]) => `${msg} (${count})`)
      .join(", ");
    showProgress(
      getString("semantic-scholar-error-message", {
        args: {
          count: failCount,
          message: errorSummary,
        },
      }),
      "error",
    );
  } else {
    const errorSummary = Array.from(errorCounts.entries())
      .map(([msg, count]) => `${msg} (${count})`)
      .join(", ");
    showProgress(
      getString("semantic-scholar-partial-message", {
        args: {
          success: successCount,
          fail: failCount,
          skip: skipCount,
          message: errorSummary,
        },
      }),
      "default",
    );
  }
}

let menuRegistrationId: string | false | null = null;

/**
 * Register the context menu item for fetching conference names
 */
export function registerMenu(): void {
  menuRegistrationId = Zotero.MenuManager.registerMenu({
    menuID: `${addon.data.config.addonRef}-semantic-scholar-menu`,
    pluginID: addon.data.config.addonID,
    target: "main/library/item",
    menus: [
      {
        menuType: "submenu",
        l10nID: getLocaleID("menu-zotero-extra"),
        menus: [
          {
            menuType: "menuitem",
            l10nID: getLocaleID("menu-fetch-conference-name"),
            onCommand: (event, context) => {
              handleFetchConferenceName(context.items || []).catch((error) => {
                ztoolkit.log(
                  `Error in fetch conference name handler: ${error}`,
                );
                showProgress(
                  getString("semantic-scholar-error-generic"),
                  "error",
                );
              });
            },
          },
        ],
      },
    ],
  });
}

/**
 * Unregister the context menu item
 */
export function unregisterMenu(): void {
  if (menuRegistrationId) {
    Zotero.MenuManager.unregisterMenu(menuRegistrationId);
    menuRegistrationId = null;
  }
}
