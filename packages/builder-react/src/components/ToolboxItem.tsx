import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FIELD_ICONS, toolboxDragId } from "../constants.js";
import type { ToolboxFieldMeta } from "../types.js";

export interface ToolboxItemProps {
  meta: ToolboxFieldMeta;
}

export function ToolboxItem({ meta }: ToolboxItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: toolboxDragId(meta.type),
      data: { type: meta.type, source: "toolbox" },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = FIELD_ICONS[meta.type];

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="rfb-builder-toolbox__item"
      style={style}
      title={meta.description ?? meta.label}
      {...listeners}
      {...attributes}
    >
      {Icon && (
        <span className="rfb-builder-toolbox__item-icon" aria-hidden="true">
          <Icon />
        </span>
      )}
      <span className="rfb-builder-toolbox__item-label">{meta.label}</span>
    </button>
  );
}
