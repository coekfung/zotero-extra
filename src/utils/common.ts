/**
 * Check if an item is a conference paper
 */
export function isConferencePaper(item: Zotero.Item): boolean {
  return item.itemType === "conferencePaper";
}
