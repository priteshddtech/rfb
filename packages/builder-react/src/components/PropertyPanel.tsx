import type {
  FormField,
  OptionsSource,
  OptionsSourceApi,
  SelectOption,
  ValidationRule,
} from "@rfb-ddt/schema";
import { useMemo, useState } from "react";
import { FIELD_ICONS } from "../constants.js";
import { IconPlus, IconTrash } from "../icons.js";
import { isDefaultFieldName, labelToName } from "../utils/naming.js";

export interface PropertyPanelProps {
  field: FormField | null;
  onChange: (patch: Partial<FormField>) => void;
  onDelete: () => void;
}

type Tab = "properties" | "css" | "actions" | "validations";

const TABS: { id: Tab; label: string }[] = [
  { id: "properties", label: "Properties" },
  { id: "css", label: "CSS" },
  { id: "actions", label: "Actions" },
  { id: "validations", label: "Validations" },
];

const TEXT_LIKE_TYPES = new Set([
  "text",
  "textarea",
  "email",
  "password",
  "phone",
  "url",
]);

const OPTION_TYPES = new Set(["select", "radio"]);

/** Static / presentational fields don't submit data and have a custom config UI. */
const STATIC_TYPES = new Set([
  "heading",
  "label",
  "span",
  "image",
  "paragraph",
  "divider",
  "spacer",
  "html",
]);

export function PropertyPanel({ field, onChange, onDelete }: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("properties");

  const validations = useMemo(
    () => field?.validation ?? [],
    [field?.validation],
  );

  const hasValidation = (type: string) =>
    validations.some((rule) => rule.type === type);

  function toggleValidation(type: "required" | "email", checked: boolean) {
    if (!field) return;
    if (type === "required") {
      onChange({ required: checked });
      return;
    }
    const next = checked
      ? [...validations, { type: "email" as const }]
      : validations.filter((rule) => rule.type !== "email");
    onChange({ validation: next });
  }

  function setLengthRule(
    type: "minLength" | "maxLength",
    value: string,
    extra: ValidationRule[] = validations,
  ): ValidationRule[] {
    const others = extra.filter((rule) => rule.type !== type);
    if (!value) return others;
    return [...others, { type, value: Number(value) || 0 }];
  }

  function applyLengthChange(
    type: "minLength" | "maxLength",
    value: string,
  ) {
    if (!field) return;
    onChange({ validation: setLengthRule(type, value) });
  }

  function setTextRule(type: "pattern", value: string) {
    if (!field) return;
    const others = validations.filter((rule) => rule.type !== type);
    if (!value) {
      onChange({ validation: others });
      return;
    }
    onChange({ validation: [...others, { type, value }] });
  }

  function handleLabelChange(nextLabel: string) {
    if (!field) return;
    const patch: Partial<FormField> = { label: nextLabel };

    if (isDefaultFieldName(field.name, field.type)) {
      const slug = labelToName(nextLabel);
      if (slug) {
        patch.name = slug;
        if (!field.dbField || field.dbField === field.name) {
          patch.dbField = slug;
        }
      }
    }
    onChange(patch);
  }

  function handleNameChange(nextName: string) {
    if (!field) return;
    const patch: Partial<FormField> = { name: nextName };
    if (!field.dbField || field.dbField === field.name) {
      patch.dbField = nextName;
    }
    onChange(patch);
  }

  const minLength = validations.find((r) => r.type === "minLength");
  const maxLength = validations.find((r) => r.type === "maxLength");
  const pattern = validations.find((r) => r.type === "pattern");

  if (!field) {
    return (
      <aside className="rfb-builder-properties">
        <div className="rfb-builder-properties__empty">
          <p>Select a field to configure its properties.</p>
        </div>
      </aside>
    );
  }

  const Icon = FIELD_ICONS[field.type];
  const supportsLength = TEXT_LIKE_TYPES.has(field.type);
  const hasOptions = OPTION_TYPES.has(field.type) && "options" in field;
  const options = hasOptions ? ((field as { options: SelectOption[] }).options ?? []) : [];
  const isStatic = STATIC_TYPES.has(field.type);

  const visibleTabs = isStatic
    ? TABS.filter((t) => t.id === "properties" || t.id === "css")
    : TABS;

  function updateOption(index: number, patch: Partial<SelectOption>) {
    if (!hasOptions) return;
    const next = options.map((opt, i) =>
      i === index ? { ...opt, ...patch } : opt,
    );
    onChange({ options: next } as Partial<FormField>);
  }

  function addOption() {
    if (!hasOptions) return;
    const nextIndex = options.length + 1;
    const newOption: SelectOption = {
      label: `Option ${nextIndex}`,
      value: `option${nextIndex}`,
    };
    onChange({ options: [...options, newOption] } as Partial<FormField>);
  }

  function removeOption(index: number) {
    if (!hasOptions) return;
    const next = options.filter((_, i) => i !== index);
    onChange({ options: next } as Partial<FormField>);
  }

  return (
    <aside className="rfb-builder-properties">
      <header className="rfb-builder-properties__header">
        {Icon && (
          <span className="rfb-builder-properties__icon" aria-hidden="true">
            <Icon />
          </span>
        )}
        <div className="rfb-builder-properties__heading">
          <strong>{field.label ?? field.name}</strong>
          <code>{field.type}</code>
        </div>
        <button
          type="button"
          className="rfb-builder-properties__delete-icon"
          onClick={onDelete}
          aria-label="Delete field"
        >
          <IconTrash />
        </button>
      </header>

      <div className="rfb-builder-tabs rfb-builder-tabs--horizontal">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={[
              "rfb-builder-tabs__tab",
              activeTab === tab.id && "rfb-builder-tabs__tab--active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rfb-builder-properties__body">
        {activeTab === "properties" && (
          <>
            {!isStatic && (
              <label className="rfb-builder-properties__field">
                <span>Label</span>
                <input
                  type="text"
                  value={field.label ?? ""}
                  onChange={(e) => handleLabelChange(e.target.value)}
                />
              </label>
            )}

            {!isStatic && (
              <label className="rfb-builder-properties__field">
                <span>Name (JSON key)</span>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </label>
            )}

            {!isStatic && (
              <label className="rfb-builder-properties__field">
                <span>DB Field</span>
                <input
                  type="text"
                  value={field.dbField ?? field.name}
                  placeholder={field.name}
                  onChange={(e) => onChange({ dbField: e.target.value })}
                />
              </label>
            )}

            <div className="rfb-builder-properties__row">
              <label className="rfb-builder-properties__field">
                <span>Group</span>
                <input
                  type="text"
                  value={String(field.props?.group ?? "General")}
                  onChange={(e) =>
                    onChange({
                      props: {
                        ...field.props,
                        group: e.target.value || "General",
                      },
                    })
                  }
                />
              </label>
              <label className="rfb-builder-properties__field">
                <span>Width (1-12)</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={Number(field.props?.gridSpan ?? 12)}
                  onChange={(e) =>
                    onChange({
                      props: {
                        ...field.props,
                        gridSpan: Math.max(
                          1,
                          Math.min(12, Number(e.target.value) || 12),
                        ),
                      },
                    })
                  }
                />
              </label>
            </div>

            {!isStatic && "placeholder" in field && (
              <label className="rfb-builder-properties__field">
                <span>Placeholder</span>
                <input
                  type="text"
                  value={field.placeholder ?? ""}
                  onChange={(e) => onChange({ placeholder: e.target.value })}
                />
              </label>
            )}

            {!isStatic && (
              <label className="rfb-builder-properties__field">
                <span>Helper text</span>
                <input
                  type="text"
                  value={field.description ?? ""}
                  placeholder="Shown under the field"
                  onChange={(e) => onChange({ description: e.target.value })}
                />
              </label>
            )}

            <StaticFieldControls field={field} onChange={onChange} />

            {supportsLength && (
              <div className="rfb-builder-properties__row">
                <label className="rfb-builder-properties__field">
                  <span>Min length</span>
                  <input
                    type="number"
                    min={0}
                    value={minLength?.type === "minLength" ? minLength.value : ""}
                    onChange={(e) => applyLengthChange("minLength", e.target.value)}
                  />
                </label>
                <label className="rfb-builder-properties__field">
                  <span>Max length</span>
                  <input
                    type="number"
                    min={0}
                    value={maxLength?.type === "maxLength" ? maxLength.value : ""}
                    onChange={(e) => applyLengthChange("maxLength", e.target.value)}
                  />
                </label>
              </div>
            )}

            {hasOptions && (
              <OptionsEditor
                options={options}
                optionsSource={
                  (field as { optionsSource?: OptionsSource }).optionsSource
                }
                onOptionsSourceChange={(next) =>
                  onChange({ optionsSource: next } as Partial<FormField>)
                }
                onUpdateOption={updateOption}
                onAddOption={addOption}
                onRemoveOption={removeOption}
              />
            )}

            {!isStatic && field.type !== "hidden" && (
              <label className="rfb-builder-properties__checkbox">
                <input
                  type="checkbox"
                  checked={!!field.required}
                  onChange={(e) => onChange({ required: e.target.checked })}
                />
                Required
              </label>
            )}
          </>
        )}

        {activeTab === "css" && (
          <CssTab field={field} onChange={onChange} />
        )}

        {activeTab === "actions" && (
          <>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={!!field.hidden}
                onChange={(e) => onChange({ hidden: e.target.checked })}
              />
              Hidden
            </label>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={!!field.disabled}
                onChange={(e) => onChange({ disabled: e.target.checked })}
              />
              Disabled
            </label>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={!!field.readonly}
                onChange={(e) => onChange({ readonly: e.target.checked })}
              />
              Read only
            </label>
            <label className="rfb-builder-properties__field">
              <span>Default Value</span>
              <input
                type="text"
                value={String(field.defaultValue ?? "")}
                onChange={(e) => onChange({ defaultValue: e.target.value })}
              />
            </label>
          </>
        )}

        {activeTab === "validations" && (
          <>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => toggleValidation("required", e.target.checked)}
              />
              Required
            </label>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={hasValidation("email")}
                onChange={(e) => toggleValidation("email", e.target.checked)}
              />
              Email validation
            </label>
            <div className="rfb-builder-properties__row">
              <label className="rfb-builder-properties__field">
                <span>Min Length</span>
                <input
                  type="number"
                  value={minLength?.type === "minLength" ? minLength.value : ""}
                  onChange={(e) => applyLengthChange("minLength", e.target.value)}
                />
              </label>
              <label className="rfb-builder-properties__field">
                <span>Max Length</span>
                <input
                  type="number"
                  value={maxLength?.type === "maxLength" ? maxLength.value : ""}
                  onChange={(e) => applyLengthChange("maxLength", e.target.value)}
                />
              </label>
            </div>
            <label className="rfb-builder-properties__field">
              <span>Pattern (regex)</span>
              <input
                type="text"
                value={pattern?.type === "pattern" ? pattern.value : ""}
                onChange={(e) => setTextRule("pattern", e.target.value)}
              />
            </label>
          </>
        )}
      </div>
    </aside>
  );
}

/* ---------- Options editor (static / api) ---------- */

interface OptionsEditorProps {
  options: SelectOption[];
  optionsSource: OptionsSource | undefined;
  onOptionsSourceChange: (next: OptionsSource | undefined) => void;
  onUpdateOption: (index: number, patch: Partial<SelectOption>) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

function OptionsEditor({
  options,
  optionsSource,
  onOptionsSourceChange,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
}: OptionsEditorProps) {
  const mode: "static" | "api" =
    optionsSource?.type === "api" ? "api" : "static";

  function switchTo(nextMode: "static" | "api") {
    if (nextMode === mode) return;
    if (nextMode === "static") {
      onOptionsSourceChange(undefined);
      return;
    }
    onOptionsSourceChange({
      type: "api",
      url: "",
      method: "GET",
      valueKey: "value",
      labelKey: "label",
    });
  }

  return (
    <div className="rfb-builder-properties__options">
      <div className="rfb-builder-properties__options-header">
        <span>Options</span>
        <div
          className="rfb-builder-properties__options-mode"
          role="tablist"
          aria-label="Options source"
        >
          {(["static", "api"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={[
                "rfb-builder-properties__options-mode-btn",
                mode === m && "rfb-builder-properties__options-mode-btn--active",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => switchTo(m)}
            >
              {m === "static" ? "Static" : "From API"}
            </button>
          ))}
        </div>
      </div>

      {mode === "static" && (
        <>
          <div className="rfb-builder-properties__options-table">
            <div className="rfb-builder-properties__options-row rfb-builder-properties__options-row--head">
              <span>Label</span>
              <span>Value</span>
              <span aria-hidden="true" />
            </div>
            {options.length === 0 && (
              <p className="rfb-builder-panel__hint">
                No options yet. Add one below.
              </p>
            )}
            {options.map((opt, index) => (
              <div key={index} className="rfb-builder-properties__options-row">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) =>
                    onUpdateOption(index, { label: e.target.value })
                  }
                  placeholder={`Option ${index + 1}`}
                />
                <input
                  type="text"
                  value={String(opt.value)}
                  onChange={(e) =>
                    onUpdateOption(index, { value: e.target.value })
                  }
                  placeholder={`option${index + 1}`}
                />
                <button
                  type="button"
                  className="rfb-builder-properties__option-remove"
                  aria-label="Remove option"
                  onClick={() => onRemoveOption(index)}
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="rfb-builder-properties__option-add"
            onClick={onAddOption}
          >
            <IconPlus /> Add option
          </button>
        </>
      )}

      {mode === "api" && optionsSource?.type === "api" && (
        <ApiOptionsEditor
          source={optionsSource}
          onChange={onOptionsSourceChange}
        />
      )}
    </div>
  );
}

/* ---------- API options editor ---------- */

interface ApiOptionsEditorProps {
  source: OptionsSourceApi;
  onChange: (next: OptionsSource) => void;
}

function ApiOptionsEditor({ source, onChange }: ApiOptionsEditorProps) {
  const [testStatus, setTestStatus] = useState<
    | { state: "idle" }
    | { state: "loading" }
    | { state: "ok"; count: number; sample: SelectOption[] }
    | { state: "error"; message: string }
  >({ state: "idle" });

  const headersText = useMemo(
    () =>
      source.headers
        ? Object.entries(source.headers)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
        : "",
    [source.headers],
  );

  function patch(p: Partial<OptionsSourceApi>) {
    onChange({ ...source, ...p });
  }

  function setHeadersFromText(text: string) {
    const headers: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const idx = trimmed.indexOf(":");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (key) headers[key] = value;
    }
    patch({ headers: Object.keys(headers).length ? headers : undefined });
  }

  async function runTest() {
    if (!source.url) {
      setTestStatus({ state: "error", message: "URL is required" });
      return;
    }
    setTestStatus({ state: "loading" });
    try {
      const init: RequestInit = { method: source.method ?? "GET" };
      if (source.headers && Object.keys(source.headers).length > 0) {
        init.headers = source.headers;
      }
      if (init.method !== "GET" && source.body) init.body = source.body;

      const res = await fetch(source.url, init);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const json: unknown = await res.json();

      const arr = readJsonPath(json, source.resultsPath);
      if (!Array.isArray(arr)) {
        setTestStatus({
          state: "error",
          message: source.resultsPath
            ? `Path "${source.resultsPath}" did not resolve to an array`
            : "Response was not an array",
        });
        return;
      }
      const sample = arr.slice(0, 3).map((item) => {
        const obj = (item ?? {}) as Record<string, unknown>;
        return {
          label: String(obj[source.labelKey] ?? obj[source.valueKey] ?? ""),
          value: String(obj[source.valueKey] ?? ""),
        };
      });
      setTestStatus({ state: "ok", count: arr.length, sample });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch";
      setTestStatus({ state: "error", message });
    }
  }

  return (
    <div className="rfb-builder-properties__api-config">
      <label className="rfb-builder-properties__field">
        <span>URL</span>
        <input
          type="url"
          value={source.url}
          placeholder="https://api.example.com/options"
          onChange={(e) => patch({ url: e.target.value })}
        />
      </label>

      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Method</span>
          <select
            className="rfb-builder-properties__select"
            value={source.method ?? "GET"}
            onChange={(e) =>
              patch({ method: e.target.value as "GET" | "POST" })
            }
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </label>
        <label className="rfb-builder-properties__field">
          <span>Results path</span>
          <input
            type="text"
            value={source.resultsPath ?? ""}
            placeholder="data.items"
            onChange={(e) =>
              patch({ resultsPath: e.target.value || undefined })
            }
          />
        </label>
      </div>

      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Value key</span>
          <input
            type="text"
            value={source.valueKey}
            placeholder="id"
            onChange={(e) => patch({ valueKey: e.target.value })}
          />
        </label>
        <label className="rfb-builder-properties__field">
          <span>Label key</span>
          <input
            type="text"
            value={source.labelKey}
            placeholder="name"
            onChange={(e) => patch({ labelKey: e.target.value })}
          />
        </label>
      </div>

      <label className="rfb-builder-properties__field">
        <span>Headers (one per line, key: value)</span>
        <textarea
          rows={2}
          defaultValue={headersText}
          placeholder={"Authorization: Bearer …\nAccept: application/json"}
          onBlur={(e) => setHeadersFromText(e.target.value)}
        />
      </label>

      {source.method === "POST" && (
        <label className="rfb-builder-properties__field">
          <span>Body (raw JSON)</span>
          <textarea
            rows={3}
            value={source.body ?? ""}
            placeholder='{"q":"…"}'
            onChange={(e) => patch({ body: e.target.value || undefined })}
          />
        </label>
      )}

      <div className="rfb-builder-properties__api-test">
        <button
          type="button"
          className="rfb-builder-properties__option-add"
          onClick={runTest}
          disabled={testStatus.state === "loading"}
        >
          {testStatus.state === "loading" ? "Testing…" : "Test fetch"}
        </button>

        {testStatus.state === "ok" && (
          <div className="rfb-builder-properties__api-test-ok">
            <p>
              Loaded <strong>{testStatus.count}</strong> item
              {testStatus.count === 1 ? "" : "s"}. Sample:
            </p>
            <ul>
              {testStatus.sample.map((s, i) => (
                <li key={i}>
                  <code>{String(s.value)}</code> — {s.label || <em>(no label)</em>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {testStatus.state === "error" && (
          <p className="rfb-builder-properties__api-test-error">
            {testStatus.message}
          </p>
        )}
      </div>

      <p className="rfb-builder-panel__hint">
        Options are fetched at form render time and mapped using{" "}
        <code>{source.valueKey || "valueKey"}</code> →&nbsp;value,&nbsp;
        <code>{source.labelKey || "labelKey"}</code> → label.
      </p>
    </div>
  );
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

/* ---------- Static / presentational field controls ---------- */

interface StaticFieldControlsProps {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}

function StaticFieldControls({ field, onChange }: StaticFieldControlsProps) {
  switch (field.type) {
    case "heading":
      return (
        <>
          <label className="rfb-builder-properties__field">
            <span>Heading text</span>
            <input
              type="text"
              value={"content" in field ? field.content : ""}
              onChange={(e) =>
                onChange({ content: e.target.value } as Partial<FormField>)
              }
            />
          </label>
          <label className="rfb-builder-properties__field">
            <span>Level</span>
            <select
              className="rfb-builder-properties__select"
              value={"level" in field ? (field.level ?? 2) : 2}
              onChange={(e) =>
                onChange({
                  level: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6,
                } as Partial<FormField>)
              }
            >
              {[1, 2, 3, 4, 5, 6].map((lvl) => (
                <option key={lvl} value={lvl}>
                  H{lvl}
                </option>
              ))}
            </select>
          </label>
        </>
      );

    case "label":
    case "span":
      return (
        <label className="rfb-builder-properties__field">
          <span>{field.type === "label" ? "Label text" : "Span text"}</span>
          <input
            type="text"
            value={"content" in field ? field.content : ""}
            onChange={(e) =>
              onChange({ content: e.target.value } as Partial<FormField>)
            }
          />
        </label>
      );

    case "paragraph":
      return (
        <label className="rfb-builder-properties__field">
          <span>Paragraph text</span>
          <textarea
            rows={4}
            value={"content" in field ? field.content : ""}
            onChange={(e) =>
              onChange({ content: e.target.value } as Partial<FormField>)
            }
          />
        </label>
      );

    case "html":
      return (
        <label className="rfb-builder-properties__field">
          <span>HTML content</span>
          <textarea
            rows={4}
            value={"content" in field ? field.content : ""}
            onChange={(e) =>
              onChange({ content: e.target.value } as Partial<FormField>)
            }
          />
        </label>
      );

    case "image":
      return (
        <>
          <label className="rfb-builder-properties__field">
            <span>Image URL</span>
            <input
              type="text"
              value={"src" in field ? field.src : ""}
              placeholder="https://…"
              onChange={(e) =>
                onChange({ src: e.target.value } as Partial<FormField>)
              }
            />
          </label>
          <label className="rfb-builder-properties__field">
            <span>Alt text</span>
            <input
              type="text"
              value={"alt" in field ? (field.alt ?? "") : ""}
              onChange={(e) =>
                onChange({ alt: e.target.value } as Partial<FormField>)
              }
            />
          </label>
          <div className="rfb-builder-properties__row">
            <label className="rfb-builder-properties__field">
              <span>Width</span>
              <input
                type="text"
                placeholder="auto"
                value={
                  "width" in field && field.width != null ? String(field.width) : ""
                }
                onChange={(e) =>
                  onChange({
                    width: e.target.value || undefined,
                  } as Partial<FormField>)
                }
              />
            </label>
            <label className="rfb-builder-properties__field">
              <span>Height</span>
              <input
                type="text"
                placeholder="auto"
                value={
                  "height" in field && field.height != null
                    ? String(field.height)
                    : ""
                }
                onChange={(e) =>
                  onChange({
                    height: e.target.value || undefined,
                  } as Partial<FormField>)
                }
              />
            </label>
          </div>
          <label className="rfb-builder-properties__field">
            <span>Click-through link (optional)</span>
            <input
              type="text"
              placeholder="https://…"
              value={"href" in field ? (field.href ?? "") : ""}
              onChange={(e) =>
                onChange({ href: e.target.value } as Partial<FormField>)
              }
            />
          </label>
        </>
      );

    case "divider":
      return (
        <label className="rfb-builder-properties__field">
          <span>Style</span>
          <select
            className="rfb-builder-properties__select"
            value={"variant" in field ? (field.variant ?? "solid") : "solid"}
            onChange={(e) =>
              onChange({
                variant: e.target.value as "solid" | "dashed" | "dotted",
              } as Partial<FormField>)
            }
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </label>
      );

    case "spacer":
      return (
        <label className="rfb-builder-properties__field">
          <span>Height (px)</span>
          <input
            type="number"
            min={0}
            value={"height" in field ? (field.height ?? 24) : 24}
            onChange={(e) =>
              onChange({
                height: Math.max(0, Number(e.target.value) || 0),
              } as Partial<FormField>)
            }
          />
        </label>
      );

    default:
      return null;
  }
}

/* ---------- CSS tab ---------- */

interface CssTabProps {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}

const BORDER_STYLES: ReadonlyArray<{ value: string; label: string }> = [
  { value: "", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "double", label: "Double" },
  { value: "groove", label: "Groove" },
  { value: "ridge", label: "Ridge" },
  { value: "inset", label: "Inset" },
  { value: "outset", label: "Outset" },
];

function getStyleValue(field: FormField, key: string): string {
  const v = field.style?.[key];
  if (v == null) return "";
  return String(v);
}

function CssTab({ field, onChange }: CssTabProps) {
  function setStyle(key: string, value: string) {
    const next: Record<string, string | number> = { ...(field.style ?? {}) };
    const trimmed = value.trim();
    if (!trimmed) {
      delete next[key];
    } else {
      next[key] = trimmed;
    }
    onChange({
      style: Object.keys(next).length ? next : undefined,
    });
  }

  function setStyleMany(patch: Record<string, string>) {
    const next: Record<string, string | number> = { ...(field.style ?? {}) };
    for (const [key, value] of Object.entries(patch)) {
      const trimmed = value.trim();
      if (!trimmed) delete next[key];
      else next[key] = trimmed;
    }
    onChange({
      style: Object.keys(next).length ? next : undefined,
    });
  }

  const borderColor = getStyleValue(field, "borderColor");

  return (
    <div className="rfb-builder-properties__css">
      {/* ---------- UI Configuration ---------- */}
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">
          UI Configuration
        </h4>
        <label className="rfb-builder-properties__field">
          <span>Size</span>
          <select
            className="rfb-builder-properties__select"
            value={field.size ?? "medium"}
            onChange={(e) =>
              onChange({
                size: e.target.value as "small" | "medium" | "large",
              })
            }
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </section>

      {/* ---------- CSS Class ---------- */}
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">CSS Class</h4>
        <label className="rfb-builder-properties__field">
          <span>CSS Class Names</span>
          <input
            type="text"
            value={field.className ?? ""}
            placeholder="my-class another-class"
            onChange={(e) => onChange({ className: e.target.value })}
          />
        </label>
        <p className="rfb-builder-panel__hint">
          Enter one or more CSS class names separated by spaces.
        </p>
      </section>

      {/* ---------- Dimensions ---------- */}
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Dimensions</h4>
        <div className="rfb-builder-properties__row">
          <label className="rfb-builder-properties__field">
            <span>Width</span>
            <input
              type="text"
              placeholder="100px, 50%, auto"
              value={getStyleValue(field, "width")}
              onChange={(e) => setStyle("width", e.target.value)}
            />
          </label>
          <label className="rfb-builder-properties__field">
            <span>Height</span>
            <input
              type="text"
              placeholder="100px, auto"
              value={getStyleValue(field, "height")}
              onChange={(e) => setStyle("height", e.target.value)}
            />
          </label>
        </div>
      </section>

      {/* ---------- Margin ---------- */}
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Margin</h4>
        <BoxSidesInput
          placeholder="10px"
          values={{
            top: getStyleValue(field, "marginTop"),
            right: getStyleValue(field, "marginRight"),
            bottom: getStyleValue(field, "marginBottom"),
            left: getStyleValue(field, "marginLeft"),
          }}
          onChange={(side, value) =>
            setStyle(
              `margin${side.charAt(0).toUpperCase()}${side.slice(1)}`,
              value,
            )
          }
        />
      </section>

      {/* ---------- Padding ---------- */}
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Padding</h4>
        <BoxSidesInput
          placeholder="10px"
          values={{
            top: getStyleValue(field, "paddingTop"),
            right: getStyleValue(field, "paddingRight"),
            bottom: getStyleValue(field, "paddingBottom"),
            left: getStyleValue(field, "paddingLeft"),
          }}
          onChange={(side, value) =>
            setStyle(
              `padding${side.charAt(0).toUpperCase()}${side.slice(1)}`,
              value,
            )
          }
        />
      </section>

      {/* ---------- Border ---------- */}
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Border</h4>
        <div className="rfb-builder-properties__row">
          <label className="rfb-builder-properties__field">
            <span>Border Style</span>
            <select
              className="rfb-builder-properties__select"
              value={getStyleValue(field, "borderStyle") || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setStyleMany({
                    borderStyle: "",
                    borderTopWidth: "",
                    borderRightWidth: "",
                    borderBottomWidth: "",
                    borderLeftWidth: "",
                  });
                } else {
                  setStyle("borderStyle", value);
                }
              }}
            >
              {BORDER_STYLES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rfb-builder-properties__field">
            <span>Border Color</span>
            <div className="rfb-builder-properties__color">
              <input
                type="color"
                aria-label="Pick border color"
                value={isHexColor(borderColor) ? borderColor : "#000000"}
                onChange={(e) => setStyle("borderColor", e.target.value)}
              />
              <input
                type="text"
                placeholder="#000000 or rgb(0,0,0)"
                value={borderColor}
                onChange={(e) => setStyle("borderColor", e.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="rfb-builder-properties__sub-label">Border Width</div>
        <BoxSidesInput
          placeholder="1px"
          values={{
            top: getStyleValue(field, "borderTopWidth"),
            right: getStyleValue(field, "borderRightWidth"),
            bottom: getStyleValue(field, "borderBottomWidth"),
            left: getStyleValue(field, "borderLeftWidth"),
          }}
          onChange={(side, value) =>
            setStyle(
              `border${side.charAt(0).toUpperCase()}${side.slice(1)}Width`,
              value,
            )
          }
        />

        <label className="rfb-builder-properties__field">
          <span>Border Radius</span>
          <input
            type="text"
            placeholder='5px or 10px 5px'
            value={getStyleValue(field, "borderRadius")}
            onChange={(e) => setStyle("borderRadius", e.target.value)}
          />
        </label>
        <p className="rfb-builder-panel__hint">
          Enter border radius (e.g., "5px" or "10px 5px" for different corners).
        </p>
      </section>
    </div>
  );
}

/* ---------- Box-sides (top/right/bottom/left) input ---------- */

type BoxSide = "top" | "right" | "bottom" | "left";

interface BoxSidesInputProps {
  values: Record<BoxSide, string>;
  placeholder?: string;
  onChange: (side: BoxSide, value: string) => void;
}

function BoxSidesInput({ values, placeholder, onChange }: BoxSidesInputProps) {
  const sides: BoxSide[] = ["top", "right", "bottom", "left"];
  return (
    <div className="rfb-builder-properties__sides">
      {sides.map((side) => (
        <label key={side} className="rfb-builder-properties__side">
          <span>{side.charAt(0).toUpperCase() + side.slice(1)}</span>
          <input
            type="text"
            placeholder={placeholder}
            value={values[side]}
            onChange={(e) => onChange(side, e.target.value)}
          />
        </label>
      ))}
    </div>
  );
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}
