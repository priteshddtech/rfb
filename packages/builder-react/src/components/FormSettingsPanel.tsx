import type { FormSchema } from "@rfb-ddt/schema";

export interface FormSettingsPanelProps {
  schema: FormSchema;
  onChange: (patch: Partial<FormSchema>) => void;
}

export function FormSettingsPanel({ schema, onChange }: FormSettingsPanelProps) {
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
