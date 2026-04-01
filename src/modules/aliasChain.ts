export type AliasSourceStatus = "success" | "partial" | "no_result" | "error";

export interface AliasSourceInput {
  item: Zotero.Item;
  doi: string;
}

export interface AliasSourceResult {
  sourceName: string;
  status: AliasSourceStatus;
  alias?: string;
  error?: unknown;
}

export interface AliasSource {
  name: string;
  resolve(input: AliasSourceInput): Promise<AliasSourceResult>;
}

export interface AliasChainResult {
  result: AliasSourceResult;
  attemptedSources: string[];
}

export async function resolveAliasFromSources(
  sources: readonly AliasSource[],
  input: AliasSourceInput,
): Promise<AliasChainResult> {
  const attemptedSources: string[] = [];
  let lastResult: AliasSourceResult | undefined;

  for (const source of sources) {
    attemptedSources.push(source.name);
    const result = await source.resolve(input);
    lastResult = result;

    if (result.status === "success" || result.status === "partial") {
      return { result, attemptedSources };
    }
  }

  return {
    result: lastResult ?? {
      sourceName: "none",
      status: "no_result",
    },
    attemptedSources,
  };
}
