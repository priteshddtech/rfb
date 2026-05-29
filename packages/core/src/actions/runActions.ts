import type {
  FieldAction,
  FieldActionLoadOptions,
  OptionsSourceApi,
  SelectOption,
} from "@rfb-ddt/schema";
import { evaluateActionCondition } from "./evaluateActionCondition.js";
import type {
  ActionContext,
  ActionRunOptions,
  ActionRunResult,
} from "./types.js";

/**
 * Runs a list of actions against the context. Actions are awaited so that
 * async actions (like `loadOptions`) complete before the next one runs.
 */
export async function runActions(
  actions: FieldAction[],
  ctx: ActionContext,
  options: ActionRunOptions = {},
): Promise<ActionRunResult> {
  const result: ActionRunResult = { ran: 0, skipped: 0, errors: [] };
  const continueOnError = options.continueOnError !== false;

  for (const action of actions) {
    if (action.when && !evaluateActionCondition(action.when, ctx)) {
      result.skipped += 1;
      continue;
    }
    try {
      await runAction(action, ctx);
      result.ran += 1;
    } catch (error) {
      result.errors.push({ action, error });
      if (!continueOnError) throw error;
      // eslint-disable-next-line no-console
      console.error("[rfb] action failed:", action.type, error);
    }
  }

  return result;
}

async function runAction(action: FieldAction, ctx: ActionContext): Promise<void> {
  switch (action.type) {
    case "show":
      for (const id of action.targets) ctx.setVisibilityOverride(id, true);
      return;

    case "hide":
      for (const id of action.targets) ctx.setVisibilityOverride(id, false);
      return;

    case "enable":
      for (const id of action.targets) ctx.setDisabledOverride(id, false);
      return;

    case "disable":
      for (const id of action.targets) ctx.setDisabledOverride(id, true);
      return;

    case "resetOverrides":
      for (const id of action.targets) {
        ctx.setVisibilityOverride(id, undefined);
        ctx.setDisabledOverride(id, undefined);
      }
      return;

    case "setValue":
      for (const id of action.targets) {
        const target = ctx.getField(id);
        if (target) ctx.setValue(target.name, action.value, { silent: true });
      }
      return;

    case "copyValue": {
      const source = ctx.getField(action.sourceFieldId);
      if (!source) return;
      const sourceValue = ctx.getValue(source.name);
      for (const id of action.targets) {
        const target = ctx.getField(id);
        if (target) ctx.setValue(target.name, sourceValue, { silent: true });
      }
      return;
    }

    case "clearValue":
      for (const id of action.targets) {
        const target = ctx.getField(id);
        if (target) ctx.setValue(target.name, "", { silent: true });
      }
      return;

    case "loadOptions":
      await runLoadOptions(action, ctx);
      return;

    case "alert":
      if (typeof globalThis !== "undefined" && "alert" in globalThis) {
        try {
          (globalThis as { alert: (msg: string) => void }).alert(action.message);
        } catch {
          /* environments without alert (SSR / tests) silently ignore */
        }
      }
      return;

    case "goToPage":
      ctx.goToPage?.(action.pageId);
      return;

    case "custom": {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
      const fn = new Function("ctx", action.code);
      await Promise.resolve(fn(ctx));
      return;
    }
  }
}

async function runLoadOptions(
  action: FieldActionLoadOptions,
  ctx: ActionContext,
): Promise<void> {
  const sourceValue = ctx.sourceField
    ? ctx.getValue(ctx.sourceField.name)
    : "";
  const resolved = resolveApiSource(
    action.source,
    sourceValue,
    action.valueToken ?? "{value}",
  );

  if (!resolved.url) {
    throw new Error("loadOptions: URL is empty");
  }

  const init: RequestInit = { method: resolved.method ?? "GET" };
  if (resolved.headers && Object.keys(resolved.headers).length > 0) {
    init.headers = resolved.headers;
  }
  if (init.method !== "GET" && resolved.body) init.body = resolved.body;

  const res = await fetch(resolved.url, init);
  if (!res.ok) {
    throw new Error(`loadOptions: HTTP ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const arr = readJsonPath(json, resolved.resultsPath);
  if (!Array.isArray(arr)) {
    throw new Error(
      resolved.resultsPath
        ? `loadOptions: path "${resolved.resultsPath}" did not resolve to an array`
        : "loadOptions: response was not an array",
    );
  }
  const mapped: SelectOption[] = arr
    .map((item) => toOption(item, resolved.valueKey, resolved.labelKey))
    .filter((o): o is SelectOption => o != null);

  for (const id of action.targets) {
    ctx.setDynamicOptions(id, mapped);
  }
}

/**
 * Replaces token occurrences inside `url` and `body` so a source field's
 * value can be interpolated (e.g. `https://api/states?country={value}`).
 */
function resolveApiSource(
  source: OptionsSourceApi,
  value: unknown,
  token: string,
): OptionsSourceApi {
  const v = value == null ? "" : encodeURIComponent(String(value));
  const rawV = value == null ? "" : String(value);
  return {
    ...source,
    url: source.url.split(token).join(v),
    body: source.body ? source.body.split(token).join(rawV) : source.body,
  };
}

function readJsonPath(value: unknown, path?: string): unknown {
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
  const v: SelectOption["value"] =
    typeof rawValue === "string" ||
    typeof rawValue === "number" ||
    typeof rawValue === "boolean"
      ? rawValue
      : String(rawValue);
  const label = rawLabel == null ? String(rawValue) : String(rawLabel);
  return { value: v, label };
}
