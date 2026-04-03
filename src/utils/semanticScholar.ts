import { getString } from "../utils/locale";
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

let lastRequestTime = 0;

/**
 * Get the rate limit interval based on API key availability
 * @returns The minimum delay in milliseconds
 */
function getRateLimitInterval(): number {
  return getApiKey() ? RATE_LIMIT_WITH_API_KEY_MS : RATE_LIMIT_NO_API_KEY_MS;
}

/**
 * Rate limiter: ensures minimum delay between API requests
 * @returns Promise that resolves when it's safe to make the next request
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const waitTime = Math.max(0, getRateLimitInterval() - timeSinceLastRequest);

  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Get the Semantic Scholar API key from preferences, if configured
 */
function getApiKey(): string | undefined {
  return getPref("semanticScholarApiKey");
}

/**
 * Select the shortest alias from an array of venue alternate names
 * This typically gives us the acronym (e.g., "ACL", "NeurIPS", "ICML")
 */
export function getShortestAlias(aliases: string[]): string | null {
  if (!aliases || aliases.length === 0) {
    return null;
  }
  // Filter out empty/whitespace-only aliases and trim
  const validAliases = aliases.map((a) => a.trim()).filter((a) => a.length > 0);
  if (validAliases.length === 0) {
    return null;
  }
  return validAliases.reduce((shortest, current) =>
    current.length < shortest.length ? current : shortest,
  );
}

/**
 * Fetch the conference short name from Semantic Scholar API
 * @param doi - The DOI of the paper
 * @returns The shortest conference alias or null if not found
 */
export async function fetchConferenceShortName(
  doi: string,
): Promise<string | null> {
  // Apply rate limiting before making the request
  await rateLimit();

  // Trim and URL-encode the DOI
  const trimmedDoi = doi.trim();
  const encodedDoi = encodeURIComponent(trimmedDoi);
  const paperId = `DOI:${encodedDoi}`;
  const url = `${API_BASE_URL}/${paperId}?fields=publicationVenue`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const apiKey = getApiKey();
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  let response: XMLHttpRequest;
  try {
    response = await Zotero.HTTP.request("GET", url, {
      headers,
    });
  } catch (error) {
    // Network errors
    throw new Error(getString("semantic-scholar-error-network"), {
      cause: error,
    });
  }

  if (response.status === 404) {
    throw new Error(getString("semantic-scholar-error-not-found"));
  }

  if (response.status === 429) {
    throw new Error(getString("semantic-scholar-error-rate-limited"));
  }

  if (response.status !== 200) {
    throw new Error(
      getString("semantic-scholar-error-http", {
        args: { status: response.status },
      }),
    );
  }

  if (!response.responseText) {
    throw new Error(getString("semantic-scholar-error-empty-response"));
  }

  let data: SemanticScholarResponse;
  try {
    data = JSON.parse(response.responseText) as SemanticScholarResponse;
  } catch {
    throw new Error(getString("semantic-scholar-error-invalid-json"));
  }

  const aliases = data.publicationVenue?.alternate_names;

  if (!aliases || aliases.length === 0) {
    return null;
  }

  return getShortestAlias(aliases);
}

/**
 * Update a single item with its short conference name from Semantic Scholar
 * @param item - The Zotero item to update
 */
export async function updateItemConferenceName(
  item: Zotero.Item,
): Promise<void> {
  if (!isConferencePaper(item)) {
    throw new Error(getString("semantic-scholar-error-not-conference"));
  }

  const doi = item.getField("DOI");
  if (!doi) {
    throw new Error(getString("semantic-scholar-error-no-doi"));
  }

  const shortName = await fetchConferenceShortName(doi);
  if (!shortName) {
    throw new Error(getString("semantic-scholar-error-no-venue"));
  }

  await ztoolkit.ExtraField.setExtraField(item, EXTRA_FIELD_KEY, shortName);
}
