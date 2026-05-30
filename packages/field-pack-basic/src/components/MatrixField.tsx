import type { MatrixField as MatrixFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

type MatrixValue = Record<string, string | string[]>;

/**
 * Matrix question — rows of statements × columns of choices.
 * `multiple` toggles between radio (one per row) and checkbox (many per row).
 */
export function MatrixFieldComponent({
  field,
  value,
  onChange,
  error,
  disabled,
  readOnly,
}: FieldComponentProps<MatrixFieldSchema>) {
  const id = fieldControlId(field.id);
  const multiple = field.multiple === true;
  const rows = field.rows ?? [];
  const columns = field.columns ?? [];
  const current = (value as MatrixValue | undefined) ?? {};

  function setRowValue(rowId: string, optionValue: string) {
    if (multiple) {
      const existing = Array.isArray(current[rowId])
        ? (current[rowId] as string[])
        : [];
      const next = existing.includes(optionValue)
        ? existing.filter((v) => v !== optionValue)
        : [...existing, optionValue];
      onChange({ ...current, [rowId]: next });
    } else {
      onChange({ ...current, [rowId]: optionValue });
    }
  }

  function isChecked(rowId: string, optionValue: string): boolean {
    const cell = current[rowId];
    if (Array.isArray(cell)) return cell.includes(optionValue);
    return cell === optionValue;
  }

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div className="rfb-matrix" id={id}>
        <table className="rfb-matrix__table">
          <thead>
            <tr>
              <th scope="col" className="rfb-matrix__corner" />
              {columns.map((col) => (
                <th
                  key={String(col.value)}
                  scope="col"
                  className="rfb-matrix__col-header"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="rfb-matrix__row-header">
                  {row.label}
                </th>
                {columns.map((col) => {
                  const checked = isChecked(row.id, String(col.value));
                  return (
                    <td key={String(col.value)} className="rfb-matrix__cell">
                      <input
                        type={multiple ? "checkbox" : "radio"}
                        name={`${field.name}-${row.id}`}
                        value={String(col.value)}
                        checked={checked}
                        disabled={disabled || readOnly || col.disabled}
                        aria-label={`${row.label}: ${col.label}`}
                        onChange={() => setRowValue(row.id, String(col.value))}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={Math.max(1, columns.length + 1)}
                  className="rfb-matrix__empty"
                >
                  Add rows and columns in the field config to build a matrix.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </FieldWrapper>
  );
}
