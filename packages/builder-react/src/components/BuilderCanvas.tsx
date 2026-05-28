import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { FormField } from "@rfb-ddt/schema";
import { CANVAS_DROP_ID } from "../constants.js";
import { CanvasFieldItem } from "./CanvasFieldItem.js";

export interface BuilderCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onRemoveField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
  onResizeField: (fieldId: string, span: number) => void;
  onMoveField: (fieldId: string, direction: "up" | "down") => void;
}

export function BuilderCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onRemoveField,
  onDuplicateField,
  onResizeField,
  onMoveField,
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROP_ID });

  return (
    <section className="rfb-builder-canvas">
      <div
        ref={setNodeRef}
        className={[
          "rfb-builder-canvas__dropzone",
          isOver && "rfb-builder-canvas__dropzone--over",
          fields.length === 0 && "rfb-builder-canvas__dropzone--empty",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {fields.length === 0 ? (
          <p className="rfb-builder-canvas__empty">
            Drag fields here to build your form
          </p>
        ) : (
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={rectSortingStrategy}
          >
            <div className="rfb-builder-canvas__grid">
              {fields.map((field) => (
                <CanvasFieldItem
                  key={field.id}
                  field={field}
                  selected={selectedFieldId === field.id}
                  onSelect={onSelectField}
                  onRemove={onRemoveField}
                  onDuplicate={onDuplicateField}
                  onResize={onResizeField}
                  onMove={onMoveField}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </section>
  );
}
