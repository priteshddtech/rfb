import type { FormSchema, LayoutType } from "@rfb-ddt/schema";

export interface FormSettingsPanelProps {
  schema: FormSchema;
  onChange: (patch: Partial<FormSchema>) => void;
  onLayoutTypeChange: (type: LayoutType) => void;
}

export function FormSettingsPanel({
  schema,
  onChange,
  onLayoutTypeChange,
}: FormSettingsPanelProps) {
  const layoutType: LayoutType = schema.layout?.type ?? "single";

  return (
    <div className="rfb-builder-form-settings">
      <label className="rfb-builder-properties__field">
        <span>Form title</span>
        <input
          type="text"
          value={schema.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>
      <label className="rfb-builder-properties__field">
        <span>Description</span>
        <textarea
          rows={2}
          value={schema.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </label>

      <fieldset className="rfb-builder-form-settings__layout">
        <legend>Layout</legend>
        <p className="rfb-builder-panel__hint">
          Single page is the default. Steps walks the user through a wizard;
          tabs lets them jump between sections freely.
        </p>
        <div className="rfb-builder-form-settings__layout-options">
          {(["single", "steps", "tabs"] as const).map((type) => (
            <label key={type} className="rfb-builder-form-settings__layout-option">
              <input
                type="radio"
                name="rfb-layout-type"
                value={type}
                checked={layoutType === type}
                onChange={() => onLayoutTypeChange(type)}
              />
              <span>
                {type === "single" && "Single page"}
                {type === "steps" && "Multi-step"}
                {type === "tabs" && "Multi-tab"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="rfb-builder-properties__field">
        <span>Submit button label</span>
        <input
          type="text"
          value={schema.settings?.submitLabel ?? ""}
          onChange={(e) =>
            onChange({
              settings: { ...schema.settings, submitLabel: e.target.value },
            })
          }
        />
      </label>
    </div>
  );
}
