import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SCHEMA_VERSION, type FormField, type FormSchema } from "@rfb-ddt/schema";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CANVAS_DROP_ID,
  DEFAULT_TOOLBOX_FIELDS,
  FIELD_ICONS,
  parseToolboxDragId,
} from "./constants.js";
import { BuilderCanvas } from "./components/BuilderCanvas.js";
import { BuilderPreview } from "./components/BuilderPreview.js";
import { PropertyPanel } from "./components/PropertyPanel.js";
import { Toolbox, type ToolboxPanel } from "./components/Toolbox.js";
import {
  IconClipboard,
  IconCloud,
  IconCode,
  IconDownload,
  IconEye,
  IconPlus,
  IconRedo,
  IconSave,
  IconText,
  IconUndo,
} from "./icons.js";
import type { FormBuilderProps } from "./types.js";
import { createDefaultField } from "./utils/createField.js";
import {
  duplicateFieldInSchema,
  insertFieldInSchema,
  moveFieldInSchema,
  removeFieldFromSchema,
  reorderFieldsInSchema,
  resizeFieldInSchema,
  updateFieldInSchema,
} from "./utils/schemaHelpers.js";
import "./styles/builder.css";

function createEmptySchema(): FormSchema {
  return {
    id: "new-form",
    version: SCHEMA_VERSION,
    title: "Untitled form",
    description: "",
    settings: {
      submitLabel: "Submit",
      cancelLabel: "Cancel",
    },
    layout: { type: "single" },
    fields: [],
  };
}

export function FormBuilder({
  schema: controlledSchema,
  defaultSchema,
  onChange,
  className,
  showPreview = true,
  fullscreen = true,
}: FormBuilderProps) {
  const [internalSchema, setInternalSchema] = useState<FormSchema>(
    () => defaultSchema ?? createEmptySchema(),
  );
  const schema = controlledSchema ?? internalSchema;

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [leftPanel, setLeftPanel] = useState<ToolboxPanel>("components");
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "json">(
    "edit",
  );
  const [past, setPast] = useState<FormSchema[]>([]);
  const [future, setFuture] = useState<FormSchema[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedField = useMemo(
    () => schema.fields.find((f) => f.id === selectedFieldId) ?? null,
    [schema.fields, selectedFieldId],
  );

  const updateSchema = useCallback(
    (next: FormSchema, trackHistory = true) => {
      if (trackHistory) {
        setPast((prev) => [...prev.slice(-39), schema]);
        setFuture([]);
      }
      if (controlledSchema === undefined) {
        setInternalSchema(next);
      }
      onChange?.(next);
    },
    [controlledSchema, onChange, schema],
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1]!;
    setPast((items) => items.slice(0, -1));
    setFuture((items) => [schema, ...items].slice(0, 40));
    updateSchema(previous, false);
  }, [past, schema, updateSchema]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0]!;
    setFuture((items) => items.slice(1));
    setPast((items) => [...items, schema].slice(-40));
    updateSchema(next, false);
  }, [future, schema, updateSchema]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        (key === "y" || (key === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [redo, undo]);

  useEffect(() => {
    if (!statusMessage) return;
    const t = setTimeout(() => setStatusMessage(null), 2500);
    return () => clearTimeout(t);
  }, [statusMessage]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  /**
   * Toolbox drags: only valid when the pointer is *physically* over the canvas.
   * Canvas reorders: use closestCenter so users don't need pixel-perfect drops.
   */
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const isFromToolbox = String(args.active.id).startsWith("toolbox:");
    if (isFromToolbox) {
      return pointerWithin(args);
    }
    return closestCenter(args);
  }, []);

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const toolboxType = parseToolboxDragId(String(active.id));
    if (toolboxType) {
      const overCanvas =
        over.id === CANVAS_DROP_ID ||
        schema.fields.some((f) => f.id === over.id);
      if (!overCanvas) return;

      const newField = createDefaultField(toolboxType, schema.fields);
      let insertIndex = schema.fields.length;
      if (over.id !== CANVAS_DROP_ID) {
        const overIndex = schema.fields.findIndex((f) => f.id === over.id);
        if (overIndex >= 0) insertIndex = overIndex + 1;
      }

      const next = insertFieldInSchema(schema, newField, insertIndex);
      updateSchema(next);
      setSelectedFieldId(newField.id);
      return;
    }

    if (active.id !== over.id) {
      const next = reorderFieldsInSchema(
        schema,
        String(active.id),
        String(over.id),
      );
      updateSchema(next);
    }
  }

  function handleFieldPatch(patch: Partial<FormField>) {
    if (!selectedFieldId) return;
    updateSchema(updateFieldInSchema(schema, selectedFieldId, patch));
  }

  function handleRemoveField(fieldId: string) {
    updateSchema(removeFieldFromSchema(schema, fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  }

  function handleMoveField(fieldId: string, direction: "up" | "down") {
    updateSchema(moveFieldInSchema(schema, fieldId, direction));
  }

  function handleDuplicateField(fieldId: string) {
    const { schema: next, duplicateId } = duplicateFieldInSchema(
      schema,
      fieldId,
    );
    updateSchema(next);
    if (duplicateId) setSelectedFieldId(duplicateId);
  }

  function handleResizeField(fieldId: string, span: number) {
    updateSchema(resizeFieldInSchema(schema, fieldId, span));
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${schema.id || "form"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Schema exported");
  }

  function handlePasteJson() {
    const text = window.prompt("Paste form JSON:");
    if (!text) return;
    try {
      const parsed = JSON.parse(text) as FormSchema;
      updateSchema(parsed);
      setStatusMessage("Schema imported");
    } catch (err) {
      setStatusMessage("Invalid JSON");
    }
  }

  function handleSave() {
    try {
      window.localStorage.setItem(
        `rfb:schema:${schema.id || "form"}`,
        JSON.stringify(schema),
      );
      setStatusMessage("Saved to local storage");
    } catch {
      setStatusMessage("Save failed");
    }
  }

  function handleAddDefaultField() {
    const newField = createDefaultField("text", schema.fields);
    updateSchema(insertFieldInSchema(schema, newField));
    setSelectedFieldId(newField.id);
  }

  const activeToolboxMeta = useMemo(() => {
    const type = activeDragId ? parseToolboxDragId(activeDragId) : null;
    if (!type) return null;
    return DEFAULT_TOOLBOX_FIELDS.find((f) => f.type === type) ?? null;
  }, [activeDragId]);

  const ActiveIcon = activeToolboxMeta
    ? FIELD_ICONS[activeToolboxMeta.type]
    : null;

  const rootClass = [
    "rfb-builder",
    fullscreen && "rfb-builder--fullscreen",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={rootClass}>
        <header className="rfb-builder__toolbar">
          <div className="rfb-builder__toolbar-section">
            <div
              className="rfb-builder-tabs rfb-builder-tabs--horizontal"
              role="tablist"
            >
              <button
                type="button"
                className={[
                  "rfb-builder-tabs__tab",
                  activeTab === "edit" && "rfb-builder-tabs__tab--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveTab("edit")}
              >
                <IconText /> Edit
              </button>
              {showPreview && (
                <button
                  type="button"
                  className={[
                    "rfb-builder-tabs__tab",
                    activeTab === "preview" && "rfb-builder-tabs__tab--active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setActiveTab("preview")}
                >
                  <IconEye /> Preview
                </button>
              )}
              <button
                type="button"
                className={[
                  "rfb-builder-tabs__tab",
                  activeTab === "json" && "rfb-builder-tabs__tab--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveTab("json")}
              >
                <IconCode /> JSON
              </button>
            </div>
          </div>

          <div className="rfb-builder__toolbar-section rfb-builder__toolbar-section--center">
            <strong className="rfb-builder__form-title">
              {schema.title || "Untitled form"}
            </strong>
            {statusMessage && (
              <span className="rfb-builder__status">{statusMessage}</span>
            )}
          </div>

          <div className="rfb-builder__toolbar-section rfb-builder__toolbar-section--end">
            <button
              type="button"
              className="rfb-builder__icon-btn"
              onClick={undo}
              disabled={past.length === 0}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <IconUndo />
            </button>
            <button
              type="button"
              className="rfb-builder__icon-btn"
              onClick={redo}
              disabled={future.length === 0}
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <IconRedo />
            </button>
            <span className="rfb-builder__divider" />
            <button
              type="button"
              className="rfb-builder__icon-btn"
              onClick={handleAddDefaultField}
              title="Add field"
              aria-label="Add field"
            >
              <IconPlus />
            </button>
            <button
              type="button"
              className="rfb-builder__icon-btn"
              onClick={handlePasteJson}
              title="Paste JSON"
              aria-label="Paste JSON"
            >
              <IconClipboard />
            </button>
            <button
              type="button"
              className="rfb-builder__icon-btn"
              onClick={handleExportJson}
              title="Export JSON"
              aria-label="Export JSON"
            >
              <IconDownload />
            </button>
            <button
              type="button"
              className="rfb-builder__icon-btn"
              title="Import from API (coming soon)"
              aria-label="Import from API"
              disabled
            >
              <IconCloud />
            </button>
            <span className="rfb-builder__divider" />
            <button
              type="button"
              className="rfb-builder__primary-btn"
              onClick={handleSave}
              title="Save"
            >
              <IconSave /> Save
            </button>
          </div>
        </header>

        {activeTab === "edit" && (
          <div className="rfb-builder__workspace">
            <Toolbox
              activePanel={leftPanel}
              onPanelChange={setLeftPanel}
              fields={DEFAULT_TOOLBOX_FIELDS}
              formTitle={schema.title ?? ""}
              formDescription={schema.description ?? ""}
              formId={schema.id}
              formVersion={schema.version}
              onFormPatch={(patch) => updateSchema({ ...schema, ...patch })}
              onMetaPatch={(patch) => updateSchema({ ...schema, ...patch })}
            />
            <BuilderCanvas
              fields={schema.fields}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onRemoveField={handleRemoveField}
              onDuplicateField={handleDuplicateField}
              onResizeField={handleResizeField}
              onMoveField={handleMoveField}
            />
            <PropertyPanel
              field={selectedField}
              onChange={handleFieldPatch}
              onDelete={() => {
                if (selectedFieldId) handleRemoveField(selectedFieldId);
              }}
            />
          </div>
        )}

        {activeTab === "preview" && showPreview && (
          <div className="rfb-builder__single-panel">
            <BuilderPreview schema={schema} />
          </div>
        )}

        {activeTab === "json" && (
          <div className="rfb-builder__single-panel">
            <pre className="rfb-builder__json">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeToolboxMeta ? (
          <div className="rfb-builder-toolbox__item rfb-builder-toolbox__item--overlay">
            {ActiveIcon && (
              <span className="rfb-builder-toolbox__item-icon" aria-hidden="true">
                <ActiveIcon />
              </span>
            )}
            <span className="rfb-builder-toolbox__item-label">
              {activeToolboxMeta.label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
