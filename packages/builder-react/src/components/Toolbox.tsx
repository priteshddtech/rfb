import { useMemo, useState } from "react";
import { DEFAULT_TOOLBOX_FIELDS, type ToolboxGroup } from "../constants.js";
import { IconChevronDown, IconSearch, IconX } from "../icons.js";
import type { ToolboxFieldMeta } from "../types.js";
import { ToolboxItem } from "./ToolboxItem.js";

export interface ToolboxProps {
  fields?: ToolboxFieldMeta[];
}

const GROUP_LABELS: Record<string, string> = {
  quick: "Quick Fields",
  input: "Inputs",
  choice: "Choices",
  layout: "Layout",
  static: "Static",
  media: "Media",
  advanced: "Advanced",
};

/** Order of groups in the accordion (top → bottom). */
const GROUP_ORDER: ToolboxGroup[] = [
  "quick",
  "input",
  "choice",
  "media",
  "static",
  "layout",
  "advanced",
];

/**
 * Left-side toolbox: searchable field palette with grouped accordions.
 * Form-level settings live behind the gear icon (`<SettingsView>`); the
 * toolbox is dedicated to discovering and dragging fields.
 */
export function Toolbox({ fields = DEFAULT_TOOLBOX_FIELDS }: ToolboxProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return fields;
    return fields.filter((f) => {
      const haystack = [f.label, f.description, f.type].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [fields, q]);

  const groups = useMemo(() => {
    return filtered.reduce<Record<string, ToolboxFieldMeta[]>>(
      (acc, field) => {
        const key = field.group ?? "advanced";
        acc[key] = [...(acc[key] ?? []), field];
        return acc;
      },
      {},
    );
  }, [filtered]);

  const orderedGroups: string[] = useMemo(
    () => [
      ...GROUP_ORDER.filter((g) => groups[g]?.length),
      ...Object.keys(groups).filter(
        (g) => !(GROUP_ORDER as readonly string[]).includes(g),
      ),
    ],
    [groups],
  );

  // Open every group by default; when searching, auto-open all matching groups.
  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({});
  const isOpen = (group: string) =>
    q ? true : !closedGroups[group];

  function toggleGroup(group: string) {
    if (q) return; // search auto-opens everything; ignore manual toggles
    setClosedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  }

  return (
    <aside className="rfb-builder-toolbox">
      <div className="rfb-builder-toolbox__header">
        <h2 className="rfb-builder-toolbox__heading">
          Fields <span>(Drag into canvas)</span>
        </h2>
        <div className="rfb-builder-toolbox__search">
          <span
            className="rfb-builder-toolbox__search-icon"
            aria-hidden="true"
          >
            <IconSearch />
          </span>
          <input
            type="search"
            className="rfb-builder-toolbox__search-input"
            placeholder="Search for a field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search fields"
          />
          {query && (
            <button
              type="button"
              className="rfb-builder-toolbox__search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              title="Clear search"
            >
              <IconX />
            </button>
          )}
        </div>
      </div>

      <div className="rfb-builder-toolbox__body">
        {orderedGroups.length === 0 && (
          <p className="rfb-builder-toolbox__empty">
            No fields match <strong>"{query}"</strong>.
          </p>
        )}
        {orderedGroups.map((group) => {
          const items = groups[group] ?? [];
          const open = isOpen(group);
          return (
            <section
              key={group}
              className={[
                "rfb-builder-toolbox__group",
                open
                  ? "rfb-builder-toolbox__group--open"
                  : "rfb-builder-toolbox__group--closed",
              ].join(" ")}
            >
              <button
                type="button"
                className="rfb-builder-toolbox__group-header"
                aria-expanded={open}
                onClick={() => toggleGroup(group)}
              >
                <span className="rfb-builder-toolbox__group-title">
                  {GROUP_LABELS[group] ?? group}
                </span>
                <span
                  className="rfb-builder-toolbox__group-chevron"
                  aria-hidden="true"
                >
                  <IconChevronDown />
                </span>
              </button>
              {open && (
                <div className="rfb-builder-toolbox__list">
                  {items.map((meta) => (
                    <ToolboxItem key={meta.type} meta={meta} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
