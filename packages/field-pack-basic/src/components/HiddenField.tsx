import type { HiddenField as HiddenFieldSchema } from "@rfb-ddt/schema";
import { fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

export function HiddenFieldComponent({
  field,
  value,
  onChange,
}: FieldComponentProps<HiddenFieldSchema>) {
  const id = fieldControlId(field.id);
  const stringValue = value == null ? "" : String(value);

  return (
    <input
      id={id}
      name={field.name}
      type="hidden"
      className="rfb-input rfb-input--hidden"
      value={stringValue}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
