import type { FormPage } from "@rfb-ddt/schema";
import { useEffect, useRef, useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconTrash,
} from "../icons.js";

export interface StepsBarProps {
  pages: FormPage[];
  activePageId: string | null;
  onSelect: (pageId: string) => void;
  onAdd: () => void;
  onRename: (pageId: string, title: string) => void;
  onRemove: (pageId: string) => void;
  onReorder: (pageId: string, direction: "left" | "right") => void;
  /** "steps" or "tabs" — controls labels only. */
  variant: "steps" | "tabs";
}

/**
 * Horizontal pill bar shown above the canvas while the form is in
 * multi-step or multi-tab layout mode. Each pill is a `FormPage`.
 */
export function StepsBar({
  pages,
  activePageId,
  onSelect,
  onAdd,
  onRename,
  onRemove,
  onReorder,
  variant,
}: StepsBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  function startEdit(page: FormPage) {
    setEditingId(page.id);
    setDraft(page.title ?? "");
  }

  function commitEdit() {
    if (editingId) {
      onRename(editingId, draft.trim() || fallbackTitle(variant, pages, editingId));
    }
    setEditingId(null);
  }

  return (
    <div className="rfb-builder-steps" role="tablist" aria-label={`Form ${variant}`}>
      <div className="rfb-builder-steps__list">
        {pages.map((page, index) => {
          const isActive = page.id === activePageId;
          const isEditing = editingId === page.id;
          return (
            <div
              key={page.id}
              className={[
                "rfb-builder-steps__pill",
                isActive && "rfb-builder-steps__pill--active",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className="rfb-builder-steps__index"
                onClick={() => onSelect(page.id)}
                title={variant === "steps" ? `Go to step ${index + 1}` : "Go to tab"}
                aria-current={isActive ? "page" : undefined}
              >
                {index + 1}
              </button>

              {isEditing ? (
                <input
                  ref={inputRef}
                  className="rfb-builder-steps__input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitEdit();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setEditingId(null);
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="rfb-builder-steps__title"
                  onClick={() => (isActive ? startEdit(page) : onSelect(page.id))}
                  onDoubleClick={() => startEdit(page)}
                  title="Double-click to rename"
                >
                  {page.title || fallbackTitle(variant, pages, page.id)}
                </button>
              )}

              <div className="rfb-builder-steps__actions">
                <button
                  type="button"
                  className="rfb-builder-steps__action"
                  onClick={() => onReorder(page.id, "left")}
                  disabled={index === 0}
                  aria-label="Move left"
                  title="Move left"
                >
                  <IconChevronLeft />
                </button>
                <button
                  type="button"
                  className="rfb-builder-steps__action"
                  onClick={() => onReorder(page.id, "right")}
                  disabled={index === pages.length - 1}
                  aria-label="Move right"
                  title="Move right"
                >
                  <IconChevronRight />
                </button>
                <button
                  type="button"
                  className="rfb-builder-steps__action rfb-builder-steps__action--danger"
                  onClick={() => onRemove(page.id)}
                  disabled={pages.length <= 1}
                  aria-label={`Delete ${variant === "steps" ? "step" : "tab"}`}
                  title={`Delete ${variant === "steps" ? "step" : "tab"} (and its fields)`}
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="rfb-builder-steps__add"
        onClick={onAdd}
        title={variant === "steps" ? "Add step" : "Add tab"}
      >
        <IconPlus />
        <span>{variant === "steps" ? "Add step" : "Add tab"}</span>
      </button>
    </div>
  );
}

function fallbackTitle(
  variant: "steps" | "tabs",
  pages: FormPage[],
  pageId: string,
): string {
  const index = pages.findIndex((p) => p.id === pageId);
  const prefix = variant === "steps" ? "Step" : "Tab";
  return `${prefix} ${index + 1}`;
}
