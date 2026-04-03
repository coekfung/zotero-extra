import { getString } from "../utils/locale";
import { getPref } from "./prefs";
import { isConferencePaper } from "./common";

interface SemanticScholarVenue {
  alternate_names?: string[];
}

interface SemanticScholarResponse {
  publicationVenue?: SemanticScholarVenue;
}

interface CacheEntry {
  expiresAt: number;
  value: string | null;
}

class SemanticScholarRequestError extends Error {
  retryable: boolean;
  retryAfterMs?: number;

  constructor(
    message: string,
    options: {
      retryable: boolean;
      retryAfterMs?: number;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "SemanticScholarRequestError";
    this.retryable = options.retryable;
    this.retryAfterMs = options.retryAfterMs;
  }
}

const API_BASE_URL = "https://api.semanticscholar.org/graph/v1/paper";
const EXTRA_FIELD_KEY = "shortConferenceName";

// Rate limiting: minimum delay between requests in milliseconds
// Without API key: 100 requests per 5 minutes (~1 per 3 seconds)
// With API key: 1 request per second
const RATE_LIMIT_NO_API_KEY_MS = 3500;
const RATE_LIMIT_WITH_API_KEY_MS = 1000;

const MAX_RETRY_ATTEMPTS = 3;
const CACHE_TTL_MS = 5 * 60 * 1000;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

let nextRequestTime = 0;
let requestQueue: Promise<void> = Promise.resolve();

const responseCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<string | null>>();

/**
 * Get the rate limit interval based on API key availability
 * @returns The minimum delay in milliseconds
 */
function getRateLimitInterval(): number {
  return getApiKey() ? RATE_LIMIT_WITH_API_KEY_MS : RATE_LIMIT_NO_API_KEY_MS;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rate limiter: ensures minimum delay between API requests
 * @returns Promise that resolves when it's safe to make the next request
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const waitTime = Math.max(0, nextRequestTime - now);

  if (waitTime > 0) {
    await wait(waitTime);
  }

  nextRequestTime = Date.now() + getRateLimitInterval();
}

function deferRequests(ms: number): void {
  nextRequestTime = Math.max(nextRequestTime, Date.now() + ms);
}

function enqueueRequest<T>(task: () => Promise<T>): Promise<T> {
  const queuedTask = requestQueue.then(task, task);
  requestQueue = queuedTask.then(
    () => undefined,
    () => undefined,
  );
  return queuedTask;
}

function normalizeDoi(doi: string): string {
  return doi.trim().toLowerCase();
}

function getCachedResponse(doi: string): string | null | undefined {
  const cacheEntry = responseCache.get(doi);
  if (!cacheEntry) {
    return undefined;
  }

  if (cacheEntry.expiresAt <= Date.now()) {
    responseCache.delete(doi);
    return undefined;
  }

  return cacheEntry.value;
}

function setCachedResponse(doi: string, value: string | null): void {
  responseCache.set(doi, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function parseRetryAfterMs(response: XMLHttpRequest): number | undefined {
  const retryAfterHeader = response.getResponseHeader("Retry-After");
  if (!retryAfterHeader) {
    return undefined;
  }

  const retryAfterSeconds = Number(retryAfterHeader);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return retryAfterSeconds * 1000;
  }

  const retryAfterDate = Date.parse(retryAfterHeader);
  if (Number.isNaN(retryAfterDate)) {
    return undefined;
  }

  return Math.max(0, retryAfterDate - Date.now());
}

function getRetryDelayMs(attemptIndex: number, retryAfterMs?: number): number {
  if (typeof retryAfterMs === "number") {
    return Math.max(getRateLimitInterval(), retryAfterMs);
  }

  const minDelay = attemptIndex === 0 ? 400 : 1500;
  const maxDelay = attemptIndex === 0 ? 800 : 3000;
  return Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
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

async function performConferenceLookup(doi: string): Promise<string | null> {
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

  let response: XMLHttpRequest;
  try {
    response = await Zotero.HTTP.request("GET", url, {
      headers,
    });
  } catch (error) {
    throw new SemanticScholarRequestError(
      getString("semantic-scholar-error-network"),
      {
        retryable: true,
        cause: error,
      },
    );
  }

  if (response.status === 404) {
    throw new SemanticScholarRequestError(
      getString("semantic-scholar-error-not-found"),
      {
        retryable: false,
      },
    );
  }

  if (response.status === 429) {
    throw new SemanticScholarRequestError(
      getString("semantic-scholar-error-rate-limited"),
      {
        retryable: true,
        retryAfterMs: parseRetryAfterMs(response),
      },
    );
  }

  if (response.status !== 200) {
    const retryable = RETRYABLE_STATUS_CODES.has(response.status);
    throw new SemanticScholarRequestError(
      getString("semantic-scholar-error-http", {
        args: { status: response.status },
      }),
      {
        retryable,
      },
    );
  }

  if (!response.responseText) {
    throw new SemanticScholarRequestError(
      getString("semantic-scholar-error-empty-response"),
      {
        retryable: true,
      },
    );
  }

  let data: SemanticScholarResponse;
  try {
    data = JSON.parse(response.responseText) as SemanticScholarResponse;
  } catch {
    throw new SemanticScholarRequestError(
      getString("semantic-scholar-error-invalid-json"),
      {
        retryable: true,
      },
    );
  }

  const aliases = data.publicationVenue?.alternate_names;

  if (!aliases || aliases.length === 0) {
    return null;
  }

  return getShortestAlias(aliases);
}

async function fetchConferenceShortNameUncached(
  doi: string,
): Promise<string | null> {
  let lastError: Error | undefined;

  for (
    let attemptIndex = 0;
    attemptIndex < MAX_RETRY_ATTEMPTS;
    attemptIndex++
  ) {
    try {
      await rateLimit();
      return await performConferenceLookup(doi);
    } catch (error) {
      if (!(error instanceof SemanticScholarRequestError)) {
        throw error;
      }

      lastError = error;

      if (!error.retryable || attemptIndex === MAX_RETRY_ATTEMPTS - 1) {
        if (typeof error.retryAfterMs === "number") {
          deferRequests(error.retryAfterMs);
        }
        break;
      }

      const retryDelayMs = getRetryDelayMs(attemptIndex, error.retryAfterMs);
      deferRequests(retryDelayMs);
      await wait(retryDelayMs);
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
}

/**
 * Fetch the conference short name from Semantic Scholar API
 * @param doi - The DOI of the paper
 * @returns The shortest conference alias or null if not found
 */
export async function fetchConferenceShortName(
  doi: string,
): Promise<string | null> {
  const normalizedDoi = normalizeDoi(doi);
  const cachedResponse = getCachedResponse(normalizedDoi);
  if (cachedResponse !== undefined) {
    return cachedResponse;
  }

  const inflightRequest = inflightRequests.get(normalizedDoi);
  if (inflightRequest) {
    return inflightRequest;
  }

  const requestPromise = enqueueRequest(async () => {
    const result = await fetchConferenceShortNameUncached(normalizedDoi);
    setCachedResponse(normalizedDoi, result);
    return result;
  }).finally(() => {
    inflightRequests.delete(normalizedDoi);
  });

  inflightRequests.set(normalizedDoi, requestPromise);
  return requestPromise;
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
