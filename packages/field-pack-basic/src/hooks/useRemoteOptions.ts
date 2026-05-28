import type {
  OptionsSource,
  OptionsSourceApi,
  SelectOption,
} from "@rfb-ddt/schema";
import { useEffect, useRef, useState } from "react";

export interface RemoteOptionsState {
  options: SelectOption[];
  loading: boolean;
  error: string | null;
}

/**
 * Process-wide cache so the same URL is fetched only once across all fields
 * during the lifetime of the page. Keyed by URL + method + body so the same
 * endpoint can be called with different POST bodies independently.
 */
const cache = new Map<string, Promise<unknown>>();

function cacheKey(source: OptionsSourceApi): string {
  return `${source.method ?? "GET"} ${source.url} ${source.body ?? ""}`;
}

/**
 * Reads a dot-path out of an unknown JSON value. Returns `value` itself
 * when path is empty / falsy. Returns `undefined` if any segment misses.
 */
function readPath(value: unknown, path?: string): unknown {
  if (!path) return value;
  let current: unknown = value;
  for (const segment of path.split(".")) {
    if (!segment) continue;
    if (current && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

function toOption(
  item: unknown,
  valueKey: string,
  labelKey: string,
): SelectOption | null {
  if (item == null) return null;
  if (typeof item !== "object") {
    return { value: String(item), label: String(item) };
  }
  const obj = item as Record<string, unknown>;
  const rawValue = obj[valueKey];
  const rawLabel = obj[labelKey];
  if (rawValue == null) return null;

  const value: SelectOption["value"] =
    typeof rawValue === "string" ||
    typeof rawValue === "number" ||
    typeof rawValue === "boolean"
      ? rawValue
      : String(rawValue);
  const label =
    rawLabel == null ? String(rawValue) : String(rawLabel);
  return { value, label };
}

async function fetchOnce(source: OptionsSourceApi): Promise<unknown> {
  const key = cacheKey(source);
  const existing = cache.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const method = source.method ?? "GET";
    const init: RequestInit = { method };
    if (source.headers && Object.keys(source.headers).length > 0) {
      init.headers = source.headers;
    }
    if (method !== "GET" && source.body) {
      init.body = source.body;
    }
    const res = await fetch(source.url, init);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return res.json();
  })();

  cache.set(key, promise);
  // Drop the cache entry on failure so the next render can retry.
  promise.catch(() => cache.delete(key));
  return promise;
}

/** Force the next fetch for the given source to bypass the in-memory cache. */
export function invalidateRemoteOptions(source: OptionsSourceApi): void {
  cache.delete(cacheKey(source));
}

/**
 * Resolves the option list for a field based on its `optionsSource`:
 *
 * - Returns `staticOptions` immediately when source is missing or static.
 * - Fetches and maps the remote payload when source is `api`.
 * - Returns an empty list (no fetch) when `preview` is true and the source
 *   is api — the builder canvas uses this to avoid runtime network calls.
 */
export function useRemoteOptions(
  source: OptionsSource | undefined,
  staticOptions: SelectOption[],
  options?: { preview?: boolean },
): RemoteOptionsState {
  const isApi = source?.type === "api";
  const apiSource = isApi ? (source as OptionsSourceApi) : null;

  const [state, setState] = useState<RemoteOptionsState>(() => ({
    options: isApi ? [] : staticOptions,
    loading: false,
    error: null,
  }));

  // Track latest call so a slow earlier fetch can't overwrite a newer one.
  const callId = useRef(0);

  useEffect(() => {
    if (!apiSource) {
      setState({ options: staticOptions, loading: false, error: null });
      return;
    }
    if (options?.preview) {
      setState({ options: [], loading: false, error: null });
      return;
    }
    if (!apiSource.url) {
      setState({
        options: [],
        loading: false,
        error: "Missing API URL",
      });
      return;
    }

    const myId = ++callId.current;
    setState({ options: [], loading: true, error: null });

    fetchOnce(apiSource)
      .then((json) => {
        if (callId.current !== myId) return;
        const arr = readPath(json, apiSource.resultsPath);
        if (!Array.isArray(arr)) {
          setState({
            options: [],
            loading: false,
            error: apiSource.resultsPath
              ? `Path "${apiSource.resultsPath}" did not resolve to an array`
              : "API response was not an array",
          });
          return;
        }
        const mapped = arr
          .map((item) => toOption(item, apiSource.valueKey, apiSource.labelKey))
          .filter((o): o is SelectOption => o != null);
        setState({ options: mapped, loading: false, error: null });
      })
      .catch((err) => {
        if (callId.current !== myId) return;
        const message =
          err instanceof Error ? err.message : "Failed to load options";
        setState({ options: [], loading: false, error: message });
      });
    // We intentionally key on the serialized source so identical objects
    // produced by re-renders don't re-trigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isApi,
    apiSource?.url,
    apiSource?.method,
    apiSource?.body,
    apiSource?.resultsPath,
    apiSource?.valueKey,
    apiSource?.labelKey,
    serializeHeaders(apiSource?.headers),
    options?.preview,
    // staticOptions is captured for the non-api branch; serialize it lightly:
    isApi ? "" : staticOptions.map((o) => `${o.value}|${o.label}`).join(","),
  ]);

  return state;
}

function serializeHeaders(headers?: Record<string, string>): string {
  if (!headers) return "";
  return Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}
