import { useState } from "react";
import { DEFAULT_TOOLBOX_FIELDS } from "../constants.js";
import { IconChevronDown } from "../icons.js";
import type { ToolboxFieldMeta } from "../types.js";
import { ToolboxItem } from "./ToolboxItem.js";

export interface ToolboxProps {
  fields?: ToolboxFieldMeta[];
}

const GROUP_LABELS: Record<string, string> = {
  input: "Inputs",
  choice: "Choices",
  layout: "Layout",
  static: "Static",
  advanced: "Advanced",
};

/** Order of groups in the accordion. */
const GROUP_ORDER: readonly string[] = [
  "input",
  "choice",
  "layout",
  "static",
  "advanced",
];

/**
 * Left-side toolbox — just the field palette. All form-level settings
 * (general, layout, modal, meta, submission, integrations, publish) now live
 * in the top-right gear icon and are rendered by `<SettingsView>`.
 */
export function Toolbox({
  fields = DEFAULT_TOOLBOX_FIELDS,
}: ToolboxProps) {
  const groups = fields.reduce<Record<string, ToolboxFieldMeta[]>>(
    (acc, field) => {
      const key = field.group ?? "advanced";
      acc[key] = [...(acc[key] ?? []), field];
      return acc;
    },
    {},
  );

  const orderedGroups: string[] = [
    ...GROUP_ORDER.filter((g) => groups[g]?.length),
    ...Object.keys(groups).filter((g) => !GROUP_ORDER.includes(g)),
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(orderedGroups.map((g) => [g, true])),
  );

  function toggleGroup(group: string) {
    setOpenGroups((prev) => ({ ...prev, [group]: !(prev[group] ?? true) }));
  }

  return (
    <aside className="rfb-builder-toolbox">
      <div className="rfb-builder-toolbox__header">
        <span className="rfb-builder-toolbox__heading">Fields</span>
        <p className="rfb-builder-panel__hint">Drag onto canvas</p>
      </div>

      <div className="rfb-builder-toolbox__body">
        {orderedGroups.map((group) => {
          const items = groups[group] ?? [];
          const isOpen = openGroups[group] ?? true;
          return (
            <section
              key={group}
              className={[
                "rfb-builder-toolbox__group",
                isOpen
                  ? "rfb-builder-toolbox__group--open"
                  : "rfb-builder-toolbox__group--closed",
              ].join(" ")}
            >
              <button
                type="button"
                className="rfb-builder-toolbox__group-header"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group)}
              >
                <span
                  className="rfb-builder-toolbox__group-chevron"
                  aria-hidden="true"
                >
                  <IconChevronDown />
                </span>
                <span className="rfb-builder-toolbox__group-title">
                  {GROUP_LABELS[group] ?? group}
                </span>
                <span className="rfb-builder-toolbox__group-count">
                  {items.length}
                </span>
              </button>
              {isOpen && (
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
