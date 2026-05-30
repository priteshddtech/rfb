import type {
  FormField,
  FormSettings,
  LayoutType,
  ModalSettings,
  ModalSize,
} from "@rfb-ddt/schema";
import { useState } from "react";
import { DEFAULT_TOOLBOX_FIELDS } from "../constants.js";
import { IconChevronDown } from "../icons.js";
import type { ToolboxFieldMeta } from "../types.js";
import { SubmissionSettingsBlock } from "./SubmissionSettingsBlock.js";
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
  layoutType: LayoutType;
  formSettings: FormSettings | undefined;
  /** All form fields — used to surface available `{name}` tokens in the submission editor. */
  formFields: FormField[];
  onFormPatch: (patch: { title?: string; description?: string }) => void;
  onMetaPatch: (patch: { id?: string; version?: string }) => void;
  onLayoutTypeChange: (type: LayoutType) => void;
  onSettingsPatch: (patch: Partial<FormSettings>) => void;
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
  layoutType,
  formSettings,
  formFields,
  onFormPatch,
  onMetaPatch,
  onLayoutTypeChange,
  onSettingsPatch,
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

            <fieldset className="rfb-builder-form-settings__layout">
              <legend>Layout</legend>
              <div className="rfb-builder-form-settings__layout-options">
                {(
                  [
                    { id: "single", label: "Single page" },
                    { id: "steps", label: "Multi-step" },
                    { id: "tabs", label: "Multi-tab" },
                  ] as { id: LayoutType; label: string }[]
                ).map((opt) => (
                  <label
                    key={opt.id}
                    className="rfb-builder-form-settings__layout-option"
                  >
                    <input
                      type="radio"
                      name="rfb-layout-type"
                      value={opt.id}
                      checked={layoutType === opt.id}
                      onChange={() => onLayoutTypeChange(opt.id)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              <p className="rfb-builder-panel__hint">
                Steps walks the user through a wizard. Tabs lets them jump
                between sections freely. All fields are preserved when
                switching.
              </p>
            </fieldset>

            <ModalSettingsBlock
              settings={formSettings}
              onSettingsPatch={onSettingsPatch}
            />

            <SubmissionSettingsBlock
              settings={formSettings}
              formFields={formFields}
              onSettingsPatch={onSettingsPatch}
            />
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

/* ---------- Modal settings block ---------- */

interface ModalSettingsBlockProps {
  settings: FormSettings | undefined;
  onSettingsPatch: (patch: Partial<FormSettings>) => void;
}

function ModalSettingsBlock({
  settings,
  onSettingsPatch,
}: ModalSettingsBlockProps) {
  const enabled = settings?.displayAsModal === true;
  const modal = settings?.modal ?? {};

  function patchModal(p: Partial<ModalSettings>) {
    onSettingsPatch({ modal: { ...modal, ...p } });
  }

  const SIZES: { id: ModalSize; label: string }[] = [
    { id: "small", label: "Small" },
    { id: "medium", label: "Medium" },
    { id: "large", label: "Large" },
    { id: "fullscreen", label: "Full screen" },
  ];

  return (
    <fieldset className="rfb-builder-form-settings__layout">
      <legend>Modal / Popup</legend>
      <label className="rfb-builder-properties__checkbox">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) =>
            onSettingsPatch({ displayAsModal: e.target.checked })
          }
        />
        Display as modal
      </label>
      <p className="rfb-builder-panel__hint">
        Renders a trigger button that opens the form in a centred dialog.
        Switch to the <strong>Preview</strong> tab to test it.
      </p>

      {enabled && (
        <>
          <label className="rfb-builder-properties__field">
            <span>Trigger button label</span>
            <input
              type="text"
              value={modal.triggerLabel ?? ""}
              placeholder="Open form"
              onChange={(e) =>
                patchModal({ triggerLabel: e.target.value || undefined })
              }
            />
          </label>

          <label className="rfb-builder-properties__field">
            <span>Modal size</span>
            <select
              className="rfb-builder-properties__select"
              value={modal.size ?? "medium"}
              onChange={(e) =>
                patchModal({ size: e.target.value as ModalSize })
              }
            >
              {SIZES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.showTrigger !== false}
              onChange={(e) =>
                patchModal({ showTrigger: e.target.checked })
              }
            />
            Show trigger button
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.openOnLoad === true}
              onChange={(e) => patchModal({ openOnLoad: e.target.checked })}
            />
            Open automatically on load
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.closeOnBackdrop !== false}
              onChange={(e) =>
                patchModal({ closeOnBackdrop: e.target.checked })
              }
            />
            Close on backdrop click
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.closeOnEscape !== false}
              onChange={(e) =>
                patchModal({ closeOnEscape: e.target.checked })
              }
            />
            Close on Escape key
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.showCloseButton !== false}
              onChange={(e) =>
                patchModal({ showCloseButton: e.target.checked })
              }
            />
            Show close (×) button
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.closeOnSubmit !== false}
              onChange={(e) =>
                patchModal({ closeOnSubmit: e.target.checked })
              }
            />
            Close after successful submit
          </label>
        </>
      )}
    </fieldset>
  );
}
