import { useState } from "react";
import { DEFAULT_TOOLBOX_FIELDS } from "../constants.js";
import { IconChevronDown } from "../icons.js";
import type { ToolboxFieldMeta } from "../types.js";
import { ToolboxItem } from "./ToolboxItem.js";

export type ToolboxPanel = "components" | "form" | "meta";

export interface ToolboxProps {
  fields?: ToolboxFieldMeta[];
  activePanel: ToolboxPanel;
  onPanelChange: (panel: ToolboxPanel) => void;
  formTitle: string;
  formDescription: string;
  formId: string;
  formVersion: string;
  onFormPatch: (patch: { title?: string; description?: string }) => void;
  onMetaPatch: (patch: { id?: string; version?: string }) => void;
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

const TABS: { id: ToolboxPanel; label: string }[] = [
  { id: "components", label: "Fields" },
  { id: "form", label: "Settings" },
  { id: "meta", label: "Meta" },
];

export function Toolbox({
  fields = DEFAULT_TOOLBOX_FIELDS,
  activePanel,
  onPanelChange,
  formTitle,
  formDescription,
  formId,
  formVersion,
  onFormPatch,
  onMetaPatch,
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
      <div className="rfb-builder-tabs rfb-builder-tabs--horizontal">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={[
              "rfb-builder-tabs__tab",
              activePanel === tab.id && "rfb-builder-tabs__tab--active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onPanelChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rfb-builder-toolbox__body">
        {activePanel === "components" && (
          <>
            <p className="rfb-builder-panel__hint">Drag onto canvas</p>
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
          </>
        )}

        {activePanel === "form" && (
          <div className="rfb-builder-config-block">
            <label className="rfb-builder-properties__field">
              <span>Form title</span>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => onFormPatch({ title: e.target.value })}
              />
            </label>
            <label className="rfb-builder-properties__field">
              <span>Description</span>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => onFormPatch({ description: e.target.value })}
              />
            </label>
          </div>
        )}

        {activePanel === "meta" && (
          <div className="rfb-builder-config-block">
            <label className="rfb-builder-properties__field">
              <span>Form id</span>
              <input
                type="text"
                value={formId}
                onChange={(e) => onMetaPatch({ id: e.target.value })}
              />
            </label>
            <label className="rfb-builder-properties__field">
              <span>Schema version</span>
              <input
                type="text"
                value={formVersion}
                onChange={(e) => onMetaPatch({ version: e.target.value })}
              />
            </label>
          </div>
        )}
      </div>
    </aside>
  );
}
