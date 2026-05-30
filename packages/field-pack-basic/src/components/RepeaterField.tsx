import type {
  FormField,
  RepeaterField as RepeaterFieldSchema,
} from "@rfb-ddt/schema";
import { useEffect, useMemo, useRef } from "react";
import { BasicField } from "../BasicField.js";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

type Row = Record<string, unknown>;

/**
 * Repeater (a.k.a. field array / sub-form).
 *
 *  - Vertical: each row is a stacked card containing every child field.
 *  - Horizontal: each row is a table row with one column per child field —
 *    great for invoice-style "Item / Qty / Rate / Amount" layouts.
 *
 * The stored value is `Array<Record<string, unknown>>`, keyed by each
 * child field's `name`, so the submitted JSON for a field named `items`
 * is exactly `{ items: [{ ... }, { ... }] }`.
 */
export function RepeaterFieldComponent({
  field,
  value,
  onChange,
  error,
  disabled,
  readOnly,
  preview,
}: FieldComponentProps<RepeaterFieldSchema>) {
  const id = fieldControlId(field.id);
  const childFields = useMemo(() => field.fields ?? [], [field.fields]);
  const display = field.display ?? "vertical";
  const minRows = field.minRows ?? 0;
  const maxRows = field.maxRows ?? Infinity;
  const initialRows = Math.max(minRows, field.initialRows ?? 1);
  const addLabel = field.addLabel ?? "Add row";
  const removeLabel = field.removeLabel ?? "Remove";
  const showRowNumbers = field.showRowNumbers === true;

  const rawRows: Row[] = useMemo(() => {
    if (Array.isArray(value)) return value as Row[];
    return [];
  }, [value]);

  // In preview / builder canvas mode we want to *show* what a row looks like
  // even though the value array is still empty. Substitute a single sample
  // row so the user can see the layout immediately.
  const rows: Row[] =
    preview && rawRows.length === 0 && childFields.length > 0
      ? [makeEmptyRow(childFields)]
      : rawRows;

  // Seed initial rows once when the field first mounts and the value is empty.
  // Skip in preview mode — we don't want to mutate state from a static preview.
  const seededRef = useRef(false);
  useEffect(() => {
    if (preview) return;
    if (seededRef.current) return;
    if (rawRows.length === 0 && initialRows > 0 && childFields.length > 0) {
      const seed: Row[] = Array.from({ length: initialRows }, () =>
        makeEmptyRow(childFields),
      );
      onChange(seed);
    }
    seededRef.current = true;
  }, [preview, rawRows.length, initialRows, childFields, onChange]);

  function setRows(next: Row[]) {
    onChange(next);
  }

  function addRow() {
    if (rows.length >= maxRows) return;
    setRows([...rows, makeEmptyRow(childFields)]);
  }

  function removeRow(index: number) {
    if (rows.length <= minRows) return;
    setRows(rows.filter((_, i) => i !== index));
  }

  function updateCell(rowIndex: number, name: string, cellValue: unknown) {
    setRows(
      rows.map((row, i) =>
        i === rowIndex ? { ...row, [name]: cellValue } : row,
      ),
    );
  }

  const canAdd = !readOnly && !disabled && rows.length < maxRows;
  const canRemove = !readOnly && !disabled && rows.length > minRows;

  if (childFields.length === 0) {
    return (
      <FieldWrapper field={field} error={error} controlId={id}>
        <div className="rfb-repeater rfb-repeater--empty" id={id}>
          <p className="rfb-repeater__empty">
            Repeater has no fields yet. Add child fields in the builder to start
            collecting repeating data.
          </p>
        </div>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div
        className={`rfb-repeater rfb-repeater--${display}`}
        id={id}
        data-rows={rows.length}
      >
        {display === "horizontal" ? (
          <div className="rfb-repeater__table-wrap">
            <table className="rfb-repeater__table">
              <thead>
                <tr>
                  {showRowNumbers && (
                    <th scope="col" className="rfb-repeater__col-index">
                      #
                    </th>
                  )}
                  {childFields.map((child) => (
                    <th key={child.id} scope="col">
                      {child.label || child.name}
                      {child.required && (
                        <span className="rfb-field__required" aria-hidden="true">
                          {" "}
                          *
                        </span>
                      )}
                    </th>
                  ))}
                  {!readOnly && (
                    <th scope="col" className="rfb-repeater__col-actions" />
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      className="rfb-repeater__empty"
                      colSpan={
                        childFields.length +
                        (showRowNumbers ? 1 : 0) +
                        (!readOnly ? 1 : 0)
                      }
                    >
                      No rows yet. Click <strong>{addLabel}</strong> to add one.
                    </td>
                  </tr>
                )}
                {rows.map((row, index) => (
                  <tr key={index}>
                    {showRowNumbers && (
                      <th scope="row" className="rfb-repeater__row-index">
                        {index + 1}
                      </th>
                    )}
                    {childFields.map((child) => {
                      // Strip the label inside the cell so the table header shows it once.
                      const childForCell: FormField = {
                        ...child,
                        label: undefined,
                        description: undefined,
                      };
                      return (
                        <td key={child.id} className="rfb-repeater__cell">
                          <BasicField
                            field={childForCell}
                            value={row[child.name]}
                            disabled={disabled}
                            readOnly={readOnly}
                            preview={preview}
                            onChange={(v) => updateCell(index, child.name, v)}
                          />
                        </td>
                      );
                    })}
                    {!readOnly && (
                      <td className="rfb-repeater__row-actions">
                        <button
                          type="button"
                          className="rfb-repeater__remove"
                          onClick={() => removeRow(index)}
                          disabled={!canRemove}
                          aria-label={`${removeLabel} row ${index + 1}`}
                          title={removeLabel}
                        >
                          ×
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="rfb-repeater__cards">
            {rows.length === 0 && (
              <li className="rfb-repeater__empty">
                No rows yet. Click <strong>{addLabel}</strong> to add one.
              </li>
            )}
            {rows.map((row, index) => (
              <li key={index} className="rfb-repeater__card">
                <header className="rfb-repeater__card-header">
                  <span className="rfb-repeater__card-title">
                    {showRowNumbers || rows.length > 1
                      ? `Row ${index + 1}`
                      : null}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      className="rfb-repeater__remove"
                      onClick={() => removeRow(index)}
                      disabled={!canRemove}
                      aria-label={`${removeLabel} row ${index + 1}`}
                      title={removeLabel}
                    >
                      × {removeLabel}
                    </button>
                  )}
                </header>
                <div className="rfb-repeater__card-grid">
                  {childFields.map((child) => (
                    <BasicField
                      key={child.id}
                      field={child}
                      value={row[child.name]}
                      disabled={disabled}
                      readOnly={readOnly}
                      preview={preview}
                      onChange={(v) => updateCell(index, child.name, v)}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!readOnly && (
          <div className="rfb-repeater__footer">
            <button
              type="button"
              className="rfb-repeater__add"
              onClick={addRow}
              disabled={!canAdd}
              title={
                rows.length >= maxRows
                  ? `Maximum of ${maxRows} rows reached`
                  : undefined
              }
            >
              + {addLabel}
            </button>
            {Number.isFinite(maxRows) && (
              <span className="rfb-repeater__count">
                {rows.length} / {maxRows} rows
              </span>
            )}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

/** Build a blank row using each child field's `defaultValue` (when set). */
function makeEmptyRow(childFields: FormField[]): Row {
  const row: Row = {};
  for (const child of childFields) {
    if (child.defaultValue !== undefined) {
      row[child.name] = child.defaultValue;
    }
  }
  return row;
}
