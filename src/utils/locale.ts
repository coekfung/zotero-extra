import { config } from "../../package.json";
import { FluentMessageId } from "../../typings/i10n";

export { initLocale, getString, getLocaleID };

/**
 * Initialize locale data
 */
function initLocale() {
  const l10n = new (
    typeof Localization === "undefined"
      ? ztoolkit.getGlobal("Localization")
      : Localization
  )([`${config.addonRef}-addon.ftl`], true);
  addon.data.locale = {
    current: l10n,
  };
}

/**
 * Get locale string
 * @param localeString ftl key
 * @param options.branch branch name
 * @param options.args args
 */
function getString(localeString: FluentMessageId): string;
function getString(localeString: FluentMessageId, branch: string): string;
function getString(
  localeString: FluentMessageId,
  options: { branch?: string; args?: Record<string, unknown> },
): string;
function getString(...inputs: unknown[]) {
  if (inputs.length === 1) {
    return _getString(inputs[0] as FluentMessageId);
  } else if (inputs.length === 2) {
    if (typeof inputs[1] === "string") {
      return _getString(inputs[0] as FluentMessageId, { branch: inputs[1] });
    } else {
      return _getString(
        inputs[0] as FluentMessageId,
        inputs[1] as { branch?: string; args?: Record<string, unknown> },
      );
    }
  } else {
    throw new Error("Invalid arguments");
  }
}

interface Pattern {
  value: string | null;
  attributes: Array<{
    name: string;
    value: string;
  }> | null;
}

function _getString(
  localeString: FluentMessageId,
  options: { branch?: string; args?: Record<string, unknown> } = {},
): string {
  const localStringWithPrefix = `${config.addonRef}-${localeString}`;
  const { branch, args } = options;
  const pattern = addon.data.locale?.current.formatMessagesSync([
    { id: localStringWithPrefix, args },
  ])[0] as Pattern;

  if (!pattern) {
    return localStringWithPrefix;
  }
  if (branch && pattern.attributes) {
    return (
      pattern.attributes.find((attr) => attr.name === branch)?.value ||
      localStringWithPrefix
    );
  } else {
    return pattern.value || localStringWithPrefix;
  }
}

function getLocaleID(id: FluentMessageId) {
  return `${config.addonRef}-${id}`;
}
