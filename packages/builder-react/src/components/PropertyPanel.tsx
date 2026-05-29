import type {
  ActionCondition,
  ConditionOperator,
  FieldAction,
  FieldActionLoadOptions,
  FieldActionType,
  FieldEvent,
  FieldEventBinding,
  FieldId,
  FormField,
  FormPage,
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
  /** All fields in the schema — used by the actions editor for pickers. */
  allFields?: FormField[];
  /** Pages in the schema — used by the goToPage action picker. */
  pages?: FormPage[];
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

const OPTION_TYPES = new Set(["select", "radio", "checkboxGroup"]);

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

export function PropertyPanel({
  field,
  allFields,
  pages,
  onChange,
  onDelete,
}: PropertyPanelProps) {
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
            <TypeSpecificControls field={field} onChange={onChange} />

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
          <ActionsTab
            field={field}
            allFields={allFields ?? []}
            pages={pages ?? []}
            onChange={onChange}
          />
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
          <div className="rfb-builder-properties__options-list">
            {options.length === 0 && (
              <p className="rfb-builder-panel__hint">
                No options yet. Add one below.
              </p>
            )}
            {options.map((opt, index) => (
              <OptionRow
                key={index}
                option={opt}
                index={index}
                onUpdate={(patch) => onUpdateOption(index, patch)}
                onRemove={() => onRemoveOption(index)}
              />
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

/* ---------- Single option row (with optional image / description) ---------- */

interface OptionRowProps {
  option: SelectOption;
  index: number;
  onUpdate: (patch: Partial<SelectOption>) => void;
  onRemove: () => void;
}

function OptionRow({ option, index, onUpdate, onRemove }: OptionRowProps) {
  const [expanded, setExpanded] = useState<boolean>(
    !!(option.image || option.description || option.disabled),
  );

  return (
    <div className="rfb-builder-properties__option-card">
      <div className="rfb-builder-properties__option-row">
        {option.image && (
          <span className="rfb-builder-properties__option-thumb" aria-hidden="true">
            <img src={option.image} alt="" />
          </span>
        )}
        <input
          type="text"
          value={option.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder={`Option ${index + 1}`}
          aria-label="Option label"
        />
        <input
          type="text"
          value={String(option.value)}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder={`option${index + 1}`}
          aria-label="Option value"
        />
        <button
          type="button"
          className="rfb-builder-properties__option-toggle"
          aria-label={expanded ? "Hide extras" : "Show extras"}
          title="Image / description / disabled"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "▾" : "▸"}
        </button>
        <button
          type="button"
          className="rfb-builder-properties__option-remove"
          aria-label="Remove option"
          onClick={onRemove}
        >
          <IconTrash />
        </button>
      </div>
      {expanded && (
        <div className="rfb-builder-properties__option-extras">
          <label className="rfb-builder-properties__field">
            <span>Image URL</span>
            <input
              type="text"
              value={option.image ?? ""}
              placeholder="https://… (leave empty for text-only option)"
              onChange={(e) =>
                onUpdate({ image: e.target.value || undefined })
              }
            />
          </label>
          <label className="rfb-builder-properties__field">
            <span>Image alt</span>
            <input
              type="text"
              value={option.imageAlt ?? ""}
              placeholder={option.label}
              onChange={(e) =>
                onUpdate({ imageAlt: e.target.value || undefined })
              }
            />
          </label>
          <label className="rfb-builder-properties__field">
            <span>Description</span>
            <input
              type="text"
              value={option.description ?? ""}
              placeholder="Secondary descriptive text"
              onChange={(e) =>
                onUpdate({ description: e.target.value || undefined })
              }
            />
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={!!option.disabled}
              onChange={(e) =>
                onUpdate({ disabled: e.target.checked || undefined })
              }
            />
            Disabled
          </label>
        </div>
      )}
    </div>
  );
}

/* ---------- Type-specific advanced controls ---------- */

interface TypeSpecificControlsProps {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}

function TypeSpecificControls({ field, onChange }: TypeSpecificControlsProps) {
  if (field.type === "select") {
    const sel = field as { multiple?: boolean; searchable?: boolean; creatable?: boolean };
    return (
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Dropdown behaviour</h4>
        <label className="rfb-builder-properties__checkbox">
          <input
            type="checkbox"
            checked={!!sel.multiple}
            onChange={(e) =>
              onChange({ multiple: e.target.checked } as Partial<FormField>)
            }
          />
          Allow multiple selection
        </label>
        <label className="rfb-builder-properties__checkbox">
          <input
            type="checkbox"
            checked={sel.searchable !== false}
            onChange={(e) =>
              onChange({ searchable: e.target.checked } as Partial<FormField>)
            }
          />
          Searchable (typeahead filter)
        </label>
        <label className="rfb-builder-properties__checkbox">
          <input
            type="checkbox"
            checked={!!sel.creatable}
            onChange={(e) =>
              onChange({ creatable: e.target.checked } as Partial<FormField>)
            }
          />
          Allow user to add custom values
        </label>
        <p className="rfb-builder-panel__hint">
          Enabling multi-select, searchable, or creatable swaps the native
          <code> &lt;select&gt; </code>
          for a custom combobox with chips and keyboard navigation.
        </p>
      </section>
    );
  }

  if (field.type === "radio" || field.type === "checkboxGroup") {
    const f = field as {
      display?: "list" | "grid";
      columns?: number;
      maxSelected?: number;
      minSelected?: number;
    };
    return (
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Layout</h4>
        <div className="rfb-builder-properties__row">
          <label className="rfb-builder-properties__field">
            <span>Display</span>
            <select
              className="rfb-builder-properties__select"
              value={f.display ?? "list"}
              onChange={(e) =>
                onChange({
                  display: e.target.value as "list" | "grid",
                } as Partial<FormField>)
              }
            >
              <option value="list">List (stacked)</option>
              <option value="grid">Grid (cards)</option>
            </select>
          </label>
          {f.display === "grid" && (
            <label className="rfb-builder-properties__field">
              <span>Columns</span>
              <input
                type="number"
                min={1}
                max={6}
                value={f.columns ?? 3}
                onChange={(e) =>
                  onChange({
                    columns: Math.max(1, Math.min(6, Number(e.target.value) || 1)),
                  } as Partial<FormField>)
                }
              />
            </label>
          )}
        </div>
        <p className="rfb-builder-panel__hint">
          Add an <strong>Image URL</strong> to any option above to render image
          cards. Grid layout works best when every option has an image.
        </p>
        {field.type === "checkboxGroup" && (
          <div className="rfb-builder-properties__row">
            <label className="rfb-builder-properties__field">
              <span>Min selected</span>
              <input
                type="number"
                min={0}
                value={f.minSelected ?? ""}
                onChange={(e) =>
                  onChange({
                    minSelected: e.target.value
                      ? Math.max(0, Number(e.target.value))
                      : undefined,
                  } as Partial<FormField>)
                }
              />
            </label>
            <label className="rfb-builder-properties__field">
              <span>Max selected</span>
              <input
                type="number"
                min={0}
                value={f.maxSelected ?? ""}
                onChange={(e) =>
                  onChange({
                    maxSelected: e.target.value
                      ? Math.max(0, Number(e.target.value))
                      : undefined,
                  } as Partial<FormField>)
                }
              />
            </label>
          </div>
        )}
      </section>
    );
  }

  if (field.type === "textarea") {
    const f = field as { richText?: boolean; rows?: number };
    return (
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Textarea</h4>
        <label className="rfb-builder-properties__checkbox">
          <input
            type="checkbox"
            checked={!!f.richText}
            onChange={(e) =>
              onChange({ richText: e.target.checked } as Partial<FormField>)
            }
          />
          Rich text editor (WYSIWYG)
        </label>
        {!f.richText && (
          <label className="rfb-builder-properties__field">
            <span>Rows</span>
            <input
              type="number"
              min={1}
              max={20}
              value={f.rows ?? 3}
              onChange={(e) =>
                onChange({
                  rows: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                } as Partial<FormField>)
              }
            />
          </label>
        )}
        <p className="rfb-builder-panel__hint">
          When enabled, the textarea becomes a contenteditable editor with bold,
          italic, headings, lists and links. The submitted value is HTML.
        </p>
      </section>
    );
  }

  if (field.type === "signature") {
    const f = field as {
      width?: number;
      height?: number;
      penColor?: string;
      penWidth?: number;
      backgroundColor?: string;
      clearable?: boolean;
    };
    return (
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Signature pad</h4>
        <div className="rfb-builder-properties__row">
          <label className="rfb-builder-properties__field">
            <span>Width (px, blank = fill)</span>
            <input
              type="number"
              min={0}
              value={f.width ?? ""}
              onChange={(e) =>
                onChange({
                  width: e.target.value ? Number(e.target.value) : undefined,
                } as Partial<FormField>)
              }
            />
          </label>
          <label className="rfb-builder-properties__field">
            <span>Height (px)</span>
            <input
              type="number"
              min={40}
              value={f.height ?? 160}
              onChange={(e) =>
                onChange({
                  height: Math.max(40, Number(e.target.value) || 160),
                } as Partial<FormField>)
              }
            />
          </label>
        </div>
        <div className="rfb-builder-properties__row">
          <label className="rfb-builder-properties__field">
            <span>Pen color</span>
            <div className="rfb-builder-properties__color">
              <input
                type="color"
                value={f.penColor ?? "#111827"}
                onChange={(e) =>
                  onChange({ penColor: e.target.value } as Partial<FormField>)
                }
              />
              <input
                type="text"
                value={f.penColor ?? "#111827"}
                onChange={(e) =>
                  onChange({ penColor: e.target.value } as Partial<FormField>)
                }
              />
            </div>
          </label>
          <label className="rfb-builder-properties__field">
            <span>Pen width (px)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={f.penWidth ?? 2}
              onChange={(e) =>
                onChange({
                  penWidth: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                } as Partial<FormField>)
              }
            />
          </label>
        </div>
        <label className="rfb-builder-properties__field">
          <span>Background color</span>
          <div className="rfb-builder-properties__color">
            <input
              type="color"
              value={f.backgroundColor ?? "#ffffff"}
              onChange={(e) =>
                onChange({
                  backgroundColor: e.target.value,
                } as Partial<FormField>)
              }
            />
            <input
              type="text"
              value={f.backgroundColor ?? "#ffffff"}
              onChange={(e) =>
                onChange({
                  backgroundColor: e.target.value,
                } as Partial<FormField>)
              }
            />
          </div>
        </label>
        <label className="rfb-builder-properties__checkbox">
          <input
            type="checkbox"
            checked={f.clearable !== false}
            onChange={(e) =>
              onChange({ clearable: e.target.checked } as Partial<FormField>)
            }
          />
          Show clear button
        </label>
      </section>
    );
  }

  return null;
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

/* ---------- Actions tab ---------- */

interface ActionsTabProps {
  field: FormField;
  allFields: FormField[];
  pages: FormPage[];
  onChange: (patch: Partial<FormField>) => void;
}

const EVENT_LABELS: Record<FieldEvent, string> = {
  load: "On load",
  change: "On change",
  click: "On click",
  focus: "On focus",
  blur: "On blur",
};

const ACTION_LABELS: Record<FieldActionType, string> = {
  show: "Show field(s)",
  hide: "Hide field(s)",
  enable: "Enable field(s)",
  disable: "Disable field(s)",
  resetOverrides: "Reset overrides on field(s)",
  setValue: "Set value on field(s)",
  copyValue: "Copy value from field",
  clearValue: "Clear field(s)",
  loadOptions: "Load options from API",
  alert: "Show alert",
  goToPage: "Go to step / tab",
  custom: "Run custom JavaScript",
};

const OPERATORS: { id: ConditionOperator; label: string }[] = [
  { id: "equals", label: "equals" },
  { id: "notEquals", label: "does not equal" },
  { id: "contains", label: "contains" },
  { id: "empty", label: "is empty" },
  { id: "notEmpty", label: "is not empty" },
];

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function ActionsTab({ field, allFields, pages, onChange }: ActionsTabProps) {
  const events: FieldEventBinding[] = field.events ?? [];

  function setEvents(next: FieldEventBinding[]) {
    onChange({ events: next.length ? next : undefined });
  }

  function addEvent(event: FieldEvent) {
    setEvents([
      ...events,
      { id: makeId("event"), event, actions: [] },
    ]);
  }

  function updateEvent(id: string, patch: Partial<FieldEventBinding>) {
    setEvents(
      events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function removeEvent(id: string) {
    setEvents(events.filter((e) => e.id !== id));
  }

  return (
    <div className="rfb-builder-actions">
      {/* ---------- Initial state ---------- */}
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">Initial state</h4>
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
          <span>Default value</span>
          <input
            type="text"
            value={String(field.defaultValue ?? "")}
            onChange={(e) => onChange({ defaultValue: e.target.value })}
          />
        </label>
      </section>

      {/* ---------- Event handlers ---------- */}
      <section className="rfb-builder-properties__section">
        <h4 className="rfb-builder-properties__section-title">
          Event handlers
        </h4>

        {events.length === 0 && (
          <p className="rfb-builder-panel__hint">
            No event handlers yet. Pick an event below to add one.
          </p>
        )}

        {events.map((binding) => (
          <EventBindingEditor
            key={binding.id}
            binding={binding}
            field={field}
            allFields={allFields}
            pages={pages}
            onChange={(patch) => updateEvent(binding.id, patch)}
            onRemove={() => removeEvent(binding.id)}
          />
        ))}

        <AddEventPicker onPick={addEvent} />
      </section>
    </div>
  );
}

/* ---------- Single event binding ---------- */

interface EventBindingEditorProps {
  binding: FieldEventBinding;
  field: FormField;
  allFields: FormField[];
  pages: FormPage[];
  onChange: (patch: Partial<FieldEventBinding>) => void;
  onRemove: () => void;
}

function EventBindingEditor({
  binding,
  field,
  allFields,
  pages,
  onChange,
  onRemove,
}: EventBindingEditorProps) {
  function setActions(actions: FieldAction[]) {
    onChange({ actions });
  }

  function addAction(type: FieldActionType) {
    setActions([...binding.actions, makeDefaultAction(type)]);
  }

  function updateAction(index: number, next: FieldAction) {
    const arr = [...binding.actions];
    arr[index] = next;
    setActions(arr);
  }

  function removeAction(index: number) {
    setActions(binding.actions.filter((_, i) => i !== index));
  }

  return (
    <div className="rfb-builder-actions__binding">
      <header className="rfb-builder-actions__binding-header">
        <label className="rfb-builder-actions__event-select">
          <span>Event</span>
          <select
            className="rfb-builder-properties__select"
            value={binding.event}
            onChange={(e) =>
              onChange({ event: e.target.value as FieldEvent })
            }
          >
            {(Object.keys(EVENT_LABELS) as FieldEvent[]).map((ev) => (
              <option key={ev} value={ev}>
                {EVENT_LABELS[ev]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rfb-builder-properties__delete-icon"
          onClick={onRemove}
          aria-label="Remove event handler"
          title="Remove event handler"
        >
          <IconTrash />
        </button>
      </header>

      {binding.actions.length === 0 && (
        <p className="rfb-builder-panel__hint">
          No actions yet. Add one below.
        </p>
      )}

      {binding.actions.map((action, index) => (
        <ActionEditor
          key={index}
          action={action}
          field={field}
          allFields={allFields}
          pages={pages}
          onChange={(next) => updateAction(index, next)}
          onRemove={() => removeAction(index)}
        />
      ))}

      <AddActionPicker onPick={addAction} />
    </div>
  );
}

/* ---------- Action picker buttons ---------- */

function AddEventPicker({ onPick }: { onPick: (event: FieldEvent) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rfb-builder-actions__add">
      {!open ? (
        <button
          type="button"
          className="rfb-builder-properties__option-add"
          onClick={() => setOpen(true)}
        >
          <IconPlus /> Add event handler
        </button>
      ) : (
        <div className="rfb-builder-actions__picker">
          {(Object.keys(EVENT_LABELS) as FieldEvent[]).map((ev) => (
            <button
              key={ev}
              type="button"
              className="rfb-builder-actions__picker-item"
              onClick={() => {
                onPick(ev);
                setOpen(false);
              }}
            >
              {EVENT_LABELS[ev]}
            </button>
          ))}
          <button
            type="button"
            className="rfb-builder-actions__picker-cancel"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function AddActionPicker({
  onPick,
}: {
  onPick: (type: FieldActionType) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rfb-builder-actions__add">
      {!open ? (
        <button
          type="button"
          className="rfb-builder-properties__option-add"
          onClick={() => setOpen(true)}
        >
          <IconPlus /> Add action
        </button>
      ) : (
        <div className="rfb-builder-actions__picker">
          {(Object.keys(ACTION_LABELS) as FieldActionType[]).map((t) => (
            <button
              key={t}
              type="button"
              className="rfb-builder-actions__picker-item"
              onClick={() => {
                onPick(t);
                setOpen(false);
              }}
            >
              {ACTION_LABELS[t]}
            </button>
          ))}
          <button
            type="button"
            className="rfb-builder-actions__picker-cancel"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Single action ---------- */

interface ActionEditorProps {
  action: FieldAction;
  field: FormField;
  allFields: FormField[];
  pages: FormPage[];
  onChange: (next: FieldAction) => void;
  onRemove: () => void;
}

function ActionEditor({
  action,
  field,
  allFields,
  pages,
  onChange,
  onRemove,
}: ActionEditorProps) {
  const otherFields = allFields.filter((f) => f.id !== field.id);

  return (
    <div className="rfb-builder-actions__action">
      <header className="rfb-builder-actions__action-header">
        <select
          className="rfb-builder-properties__select rfb-builder-actions__action-type"
          value={action.type}
          onChange={(e) => {
            const nextType = e.target.value as FieldActionType;
            if (nextType === action.type) return;
            onChange(makeDefaultAction(nextType));
          }}
        >
          {(Object.keys(ACTION_LABELS) as FieldActionType[]).map((t) => (
            <option key={t} value={t}>
              {ACTION_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rfb-builder-properties__option-remove"
          onClick={onRemove}
          aria-label="Remove action"
        >
          <IconTrash />
        </button>
      </header>

      <ConditionEditor
        condition={action.when}
        allFields={allFields}
        onChange={(next) => onChange({ ...action, when: next })}
      />

      <ActionTypeFields
        action={action}
        otherFields={otherFields}
        pages={pages}
        onChange={onChange}
      />
    </div>
  );
}

/* ---------- Condition (when) editor ---------- */

interface ConditionEditorProps {
  condition: ActionCondition | undefined;
  allFields: FormField[];
  onChange: (next: ActionCondition | undefined) => void;
}

function ConditionEditor({
  condition,
  allFields,
  onChange,
}: ConditionEditorProps) {
  const enabled = !!condition;
  const needsValue =
    condition?.operator !== "empty" && condition?.operator !== "notEmpty";

  function toggle(checked: boolean) {
    if (checked) {
      onChange({
        fieldId: allFields[0]?.id ?? "",
        operator: "equals",
        value: "",
      });
    } else {
      onChange(undefined);
    }
  }

  return (
    <div className="rfb-builder-actions__when">
      <label className="rfb-builder-properties__checkbox">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => toggle(e.target.checked)}
        />
        Only when…
      </label>
      {enabled && condition && (
        <div className="rfb-builder-actions__when-row">
          <select
            className="rfb-builder-properties__select"
            value={condition.fieldId}
            onChange={(e) =>
              onChange({ ...condition, fieldId: e.target.value })
            }
          >
            <option value="">— select field —</option>
            {allFields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label ?? f.name}
              </option>
            ))}
          </select>
          <select
            className="rfb-builder-properties__select"
            value={condition.operator}
            onChange={(e) =>
              onChange({
                ...condition,
                operator: e.target.value as ConditionOperator,
              })
            }
          >
            {OPERATORS.map((op) => (
              <option key={op.id} value={op.id}>
                {op.label}
              </option>
            ))}
          </select>
          {needsValue && (
            <input
              type="text"
              placeholder="value"
              value={String(condition.value ?? "")}
              onChange={(e) =>
                onChange({ ...condition, value: e.target.value })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Per-action-type bodies ---------- */

interface ActionTypeFieldsProps {
  action: FieldAction;
  otherFields: FormField[];
  pages: FormPage[];
  onChange: (next: FieldAction) => void;
}

function ActionTypeFields({
  action,
  otherFields,
  pages,
  onChange,
}: ActionTypeFieldsProps) {
  switch (action.type) {
    case "show":
    case "hide":
    case "enable":
    case "disable":
    case "resetOverrides":
    case "clearValue":
      return (
        <TargetsPicker
          label="Target fields"
          value={action.targets}
          fields={otherFields}
          onChange={(targets) => onChange({ ...action, targets })}
        />
      );

    case "setValue":
      return (
        <>
          <TargetsPicker
            label="Target fields"
            value={action.targets}
            fields={otherFields}
            onChange={(targets) => onChange({ ...action, targets })}
          />
          <label className="rfb-builder-properties__field">
            <span>Value</span>
            <input
              type="text"
              value={String(action.value ?? "")}
              placeholder="literal value"
              onChange={(e) =>
                onChange({ ...action, value: e.target.value })
              }
            />
          </label>
        </>
      );

    case "copyValue":
      return (
        <>
          <TargetsPicker
            label="Target fields"
            value={action.targets}
            fields={otherFields}
            onChange={(targets) => onChange({ ...action, targets })}
          />
          <label className="rfb-builder-properties__field">
            <span>Copy value from</span>
            <select
              className="rfb-builder-properties__select"
              value={action.sourceFieldId}
              onChange={(e) =>
                onChange({ ...action, sourceFieldId: e.target.value })
              }
            >
              <option value="">— select field —</option>
              {otherFields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label ?? f.name}
                </option>
              ))}
            </select>
          </label>
        </>
      );

    case "loadOptions":
      return (
        <LoadOptionsEditor
          action={action}
          otherFields={otherFields}
          onChange={onChange}
        />
      );

    case "alert":
      return (
        <label className="rfb-builder-properties__field">
          <span>Message</span>
          <input
            type="text"
            value={action.message}
            onChange={(e) =>
              onChange({ ...action, message: e.target.value })
            }
          />
        </label>
      );

    case "goToPage":
      return (
        <label className="rfb-builder-properties__field">
          <span>Page</span>
          <select
            className="rfb-builder-properties__select"
            value={action.pageId}
            onChange={(e) => onChange({ ...action, pageId: e.target.value })}
          >
            <option value="">— select page —</option>
            {pages.map((p, i) => (
              <option key={p.id} value={p.id}>
                {p.title || `Page ${i + 1}`}
              </option>
            ))}
          </select>
          {pages.length === 0 && (
            <span className="rfb-builder-panel__hint">
              Switch the form layout to Steps / Tabs to enable this.
            </span>
          )}
        </label>
      );

    case "custom":
      return (
        <label className="rfb-builder-properties__field">
          <span>JavaScript</span>
          <textarea
            rows={5}
            spellCheck={false}
            value={action.code}
            placeholder={
              "// ctx: { values, getValue, setValue, setVisibilityOverride, ... }\n" +
              'if (ctx.getValue("country") === "US") {\n' +
              '  ctx.setVisibilityOverride("state", true);\n' +
              "}"
            }
            onChange={(e) => onChange({ ...action, code: e.target.value })}
          />
          <span className="rfb-builder-panel__hint">
            Receives <code>ctx</code> as the only argument. Runs sandboxed via
            <code> new Function</code>.
          </span>
        </label>
      );
  }
}

/* ---------- Multi-field target picker ---------- */

interface TargetsPickerProps {
  label: string;
  value: FieldId[];
  fields: FormField[];
  onChange: (next: FieldId[]) => void;
}

function TargetsPicker({ label, value, fields, onChange }: TargetsPickerProps) {
  function toggle(id: FieldId) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div className="rfb-builder-actions__targets">
      <span className="rfb-builder-actions__targets-label">{label}</span>
      {fields.length === 0 && (
        <p className="rfb-builder-panel__hint">
          No other fields available. Add more fields first.
        </p>
      )}
      <div className="rfb-builder-actions__targets-list">
        {fields.map((f) => (
          <label
            key={f.id}
            className={[
              "rfb-builder-actions__target",
              value.includes(f.id) && "rfb-builder-actions__target--active",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="checkbox"
              checked={value.includes(f.id)}
              onChange={() => toggle(f.id)}
            />
            <span>{f.label ?? f.name}</span>
            <code>{f.type}</code>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---------- Load options action editor ---------- */

interface LoadOptionsEditorProps {
  action: FieldActionLoadOptions;
  otherFields: FormField[];
  onChange: (next: FieldActionLoadOptions) => void;
}

function LoadOptionsEditor({
  action,
  otherFields,
  onChange,
}: LoadOptionsEditorProps) {
  // Only select / radio / checkboxGroup fields can receive options.
  const targetableFields = otherFields.filter(
    (f) => f.type === "select" || f.type === "radio" || f.type === "checkboxGroup",
  );

  function patchSource(p: Partial<OptionsSourceApi>) {
    onChange({ ...action, source: { ...action.source, ...p } });
  }

  return (
    <>
      <TargetsPicker
        label="Target select / radio / checkbox group fields"
        value={action.targets}
        fields={targetableFields}
        onChange={(targets) => onChange({ ...action, targets })}
      />

      <label className="rfb-builder-properties__field">
        <span>URL (use {"{value}"} for the source field value)</span>
        <input
          type="url"
          value={action.source.url}
          placeholder="https://api.example.com/states?country={value}"
          onChange={(e) => patchSource({ url: e.target.value })}
        />
      </label>

      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Method</span>
          <select
            className="rfb-builder-properties__select"
            value={action.source.method ?? "GET"}
            onChange={(e) =>
              patchSource({ method: e.target.value as "GET" | "POST" })
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
            value={action.source.resultsPath ?? ""}
            placeholder="data.items"
            onChange={(e) =>
              patchSource({ resultsPath: e.target.value || undefined })
            }
          />
        </label>
      </div>

      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Value key</span>
          <input
            type="text"
            value={action.source.valueKey}
            placeholder="id"
            onChange={(e) => patchSource({ valueKey: e.target.value })}
          />
        </label>
        <label className="rfb-builder-properties__field">
          <span>Label key</span>
          <input
            type="text"
            value={action.source.labelKey}
            placeholder="name"
            onChange={(e) => patchSource({ labelKey: e.target.value })}
          />
        </label>
      </div>

      {action.source.method === "POST" && (
        <label className="rfb-builder-properties__field">
          <span>Body (raw JSON, use {"{value}"} token)</span>
          <textarea
            rows={3}
            value={action.source.body ?? ""}
            onChange={(e) =>
              patchSource({ body: e.target.value || undefined })
            }
          />
        </label>
      )}
    </>
  );
}

/* ---------- Default action factory ---------- */

function makeDefaultAction(type: FieldActionType): FieldAction {
  switch (type) {
    case "show":
    case "hide":
    case "enable":
    case "disable":
    case "resetOverrides":
    case "clearValue":
      return { type, targets: [] };
    case "setValue":
      return { type, targets: [], value: "" };
    case "copyValue":
      return { type, targets: [], sourceFieldId: "" };
    case "loadOptions":
      return {
        type,
        targets: [],
        source: {
          type: "api",
          url: "",
          method: "GET",
          valueKey: "value",
          labelKey: "label",
        },
      };
    case "alert":
      return { type, message: "" };
    case "goToPage":
      return { type, pageId: "" };
    case "custom":
      return { type, code: "" };
  }
}
