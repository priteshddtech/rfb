import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BasicField } from "@rfb-ddt/field-pack-basic";
import type { FormField } from "@rfb-ddt/schema";
import { FIELD_ICONS } from "../constants.js";
import {
  IconArrowDown,
  IconArrowUp,
  IconCopy,
  IconGrip,
  IconTrash,
} from "../icons.js";

export interface CanvasFieldItemProps {
  field: FormField;
  selected: boolean;
  onSelect: (fieldId: string) => void;
  onRemove: (fieldId: string) => void;
  onDuplicate: (fieldId: string) => void;
  onResize: (fieldId: string, span: number) => void;
  onMove: (fieldId: string, direction: "up" | "down") => void;
}

const SPAN_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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

function previewValueFor(field: FormField): unknown {
  if (STATIC_TYPES.has(field.type)) return undefined;
  if (field.defaultValue !== undefined) return field.defaultValue;
  switch (field.type) {
    case "checkbox":
      return false;
    case "checkboxGroup":
      return [];
    case "rating":
    case "slider":
    case "number":
      return "";
    case "file":
      return null;
    case "signature":
      return "";
    default:
      return "";
  }
}

export function CanvasFieldItem({
  field,
  selected,
  onSelect,
  onRemove,
  onDuplicate,
  onResize,
  onMove,
}: CanvasFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { type: field.type, source: "canvas" },
  });

  const span = Math.max(1, Math.min(12, Number(field.props?.gridSpan ?? 12)));
  const Icon = FIELD_ICONS[field.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    gridColumn: `span ${span} / span ${span}`,
  };

  const isHiddenField = field.type === "hidden";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rfb-builder-canvas__item",
        selected && "rfb-builder-canvas__item--selected",
        isHiddenField && "rfb-builder-canvas__item--hidden-type",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(field.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(field.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${field.label ?? field.name} (${field.type})`}
    >
      {selected && (
        <span className="rfb-builder-canvas__item-badge" aria-hidden="true">
          Selected
        </span>
      )}

      {(field.conditions?.length ?? 0) > 0 && (
        <span
          className="rfb-builder-canvas__item-badge rfb-builder-canvas__item-badge--conditional"
          title={`${field.conditions!.length} conditional rule${field.conditions!.length === 1 ? "" : "s"}`}
        >
          ⚡ {field.conditions!.length} rule
          {field.conditions!.length === 1 ? "" : "s"}
        </span>
      )}

      <div
        className="rfb-builder-canvas__item-drag"
        {...attributes}
        {...listeners}
        role="button"
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <IconGrip />
      </div>

      <div
        className="rfb-builder-canvas__item-actions"
        onClick={(e) => e.stopPropagation()}
      >
        {Icon && (
          <span
            className="rfb-builder-canvas__item-type-icon"
            aria-label={field.type}
            title={field.type}
          >
            <Icon />
          </span>
        )}
        <button
          type="button"
          className="rfb-builder-canvas__item-action"
          aria-label="Move up"
          title="Move up"
          onClick={() => onMove(field.id, "up")}
        >
          <IconArrowUp />
        </button>
        <button
          type="button"
          className="rfb-builder-canvas__item-action"
          aria-label="Move down"
          title="Move down"
          onClick={() => onMove(field.id, "down")}
        >
          <IconArrowDown />
        </button>
        <button
          type="button"
          className="rfb-builder-canvas__item-action"
          aria-label="Duplicate"
          title="Duplicate"
          onClick={() => onDuplicate(field.id)}
        >
          <IconCopy />
        </button>
        <button
          type="button"
          className="rfb-builder-canvas__item-action rfb-builder-canvas__item-action--danger"
          aria-label={`Remove ${field.label ?? field.name}`}
          title="Delete"
          onClick={() => onRemove(field.id)}
        >
          <IconTrash />
        </button>
      </div>

      <div className="rfb-builder-canvas__item-preview">
        {isHiddenField ? (
          <p className="rfb-builder-canvas__item-hidden">
            <span aria-hidden="true">{Icon && <Icon />}</span>
            Hidden field · <code>{field.name}</code>
          </p>
        ) : (
          <div className="rfb-builder-canvas__item-preview-inner" aria-hidden="true">
            <BasicField
              field={field}
              value={previewValueFor(field)}
              onChange={() => {}}
              readOnly
              preview
            />
          </div>
        )}
      </div>

      <div
        className="rfb-builder-canvas__item-spans"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <label className="rfb-builder-canvas__item-span-label" htmlFor={`width-${field.id}`}>
          Width
        </label>
        <select
          id={`width-${field.id}`}
          className="rfb-builder-canvas__item-width"
          value={span}
          aria-label={`Width: ${span} of 12`}
          onChange={(e) => onResize(field.id, Number(e.target.value))}
        >
          {SPAN_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} / 12
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
