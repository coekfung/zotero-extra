import { Mutex } from "async-mutex";
import { getPref } from "./prefs";
import { isConferencePaper } from "./common";

interface SemanticScholarVenue {
  alternate_names?: string[];
}

interface SemanticScholarResponse {
  publicationVenue?: SemanticScholarVenue;
}

const API_BASE_URL = "https://api.semanticscholar.org/graph/v1/paper";
const EXTRA_FIELD_KEY = "shortConferenceName";

// Rate limiting: minimum delay between requests in milliseconds
// Without API key: 100 requests per 5 minutes (~1 per 3 seconds)
// With API key: 1 request per second
const RATE_LIMIT_NO_API_KEY_MS = 3500;
const RATE_LIMIT_WITH_API_KEY_MS = 1000;

const MAX_RETRY_ATTEMPTS = 3;

// Global mutex for serializing API requests
const apiMutex = new Mutex();

let nextRequestTime = 0;

const inflightRequests = new Map<string, Promise<string | null>>();

function getRateLimitInterval(): number {
  return getApiKey() ? RATE_LIMIT_WITH_API_KEY_MS : RATE_LIMIT_NO_API_KEY_MS;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const waitTime = Math.max(0, nextRequestTime - now);

  if (waitTime > 0) {
    await wait(waitTime);
  }

  nextRequestTime = Date.now() + getRateLimitInterval();
}

function normalizeDoi(doi: string): string {
  return doi.trim().toLowerCase();
}

function getApiKey(): string | undefined {
  return getPref("semanticScholarApiKey");
}

export function getShortestAlias(aliases: string[]): string | null {
  if (!aliases || aliases.length === 0) {
    return null;
  }
  const validAliases = aliases.map((a) => a.trim()).filter((a) => a.length > 0);
  if (validAliases.length === 0) {
    return null;
  }
  return validAliases.reduce((shortest, current) =>
    current.length < shortest.length ? current : shortest,
  );
}

async function performConferenceLookup(
  doi: string,
  attempt = 0,
): Promise<string | null> {
  const encodedDoi = encodeURIComponent(doi);
  const paperId = `DOI:${encodedDoi}`;
  const url = `${API_BASE_URL}/${paperId}?fields=publicationVenue`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const apiKey = getApiKey();
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  return apiMutex.runExclusive(async () => {
    await rateLimit();

    let response: XMLHttpRequest;
    try {
      response = await Zotero.HTTP.request("GET", url, {
        headers,
      });
    } catch (error) {
      throw new Error(`Network error: ${error}`, { cause: error });
    }

    if (response.status === 429) {
      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        await wait(getRateLimitInterval());
        return performConferenceLookup(doi, attempt + 1);
      }
      throw new Error(`${response.status} ${response.statusText}`);
    }

    if (response.status !== 200) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    if (!response.responseText) {
      throw new Error("Empty response");
    }

    let data: SemanticScholarResponse;
    try {
      data = JSON.parse(response.responseText) as SemanticScholarResponse;
    } catch {
      throw new Error("Invalid JSON response");
    }

    const aliases = data.publicationVenue?.alternate_names;

    if (!aliases || aliases.length === 0) {
      return null;
    }

    return getShortestAlias(aliases);
  });
}

/**
 * Fetch the conference short name from Semantic Scholar API.
 * Deduplicates concurrent requests for the same DOI.
 */
export async function fetchConferenceShortName(
  doi: string,
): Promise<string | null> {
  const normalizedDoi = normalizeDoi(doi);

  const inflightRequest = inflightRequests.get(normalizedDoi);
  if (inflightRequest) {
    return inflightRequest;
  }

  const requestPromise = performConferenceLookup(normalizedDoi).finally(() => {
    inflightRequests.delete(normalizedDoi);
  });

  inflightRequests.set(normalizedDoi, requestPromise);
  return requestPromise;
}

/**
 * Update a single item with its short conference name from Semantic Scholar.
 * Skips if the field already exists.
 */
export async function updateItemConferenceName(
  item: Zotero.Item,
): Promise<void> {
  if (!isConferencePaper(item)) {
    throw new Error("Not a conference paper");
  }

  const existing = ztoolkit.ExtraField.getExtraField(item, EXTRA_FIELD_KEY);
  if (existing) {
    return;
  }

  const doi = item.getField("DOI");
  if (!doi) {
    throw new Error("No DOI");
  }

  const shortName = await fetchConferenceShortName(doi);
  if (!shortName) {
    throw new Error("No venue found");
  }

  await ztoolkit.ExtraField.setExtraField(item, EXTRA_FIELD_KEY, shortName);
}
