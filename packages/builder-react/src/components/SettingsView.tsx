import type {
  FormField,
  FormSchema,
  FormSettings,
  LayoutType,
  ModalSettings,
} from "@rfb-ddt/schema";
import { useState } from "react";
import {
  IconCode,
  IconDesktop,
  IconDownload,
  IconMobile,
  IconPalette,
  IconPlug,
  IconRocket,
  IconSettings,
  IconShare,
  IconTablet,
} from "../icons.js";
import {
  EmailNotificationsEditor,
  SubmissionBehaviorBlock,
  WebhooksEditor,
} from "./SubmissionSettingsBlock.js";

export type SettingsTopTab =
  | "settings"
  | "design"
  | "integrations"
  | "publish";

export interface SettingsViewProps {
  schema: FormSchema;
  formFields: FormField[];
  onSchemaPatch: (patch: Partial<FormSchema>) => void;
  onSettingsPatch: (patch: Partial<FormSettings>) => void;
  onLayoutTypeChange: (type: LayoutType) => void;
  onReplaceSchema: (next: FormSchema) => void;
  onExportJson: () => void;
  onImportJson: () => void;
  initialTab?: SettingsTopTab;
}

/**
 * Full-workspace settings view triggered by the top-right gear icon.
 * Replaces the 3-column builder layout while open.
 */
export function SettingsView({
  schema,
  formFields,
  onSchemaPatch,
  onSettingsPatch,
  onLayoutTypeChange,
  onReplaceSchema,
  onExportJson,
  onImportJson,
  initialTab = "settings",
}: SettingsViewProps) {
  const [tab, setTab] = useState<SettingsTopTab>(initialTab);

  return (
    <div className="rfb-builder-settings">
      <nav className="rfb-builder-settings__tabs" role="tablist">
        <SettingsTabButton
          active={tab === "settings"}
          onClick={() => setTab("settings")}
          icon={<IconSettings />}
          label="Settings"
        />
        <SettingsTabButton
          active={tab === "design"}
          onClick={() => setTab("design")}
          icon={<IconPalette />}
          label="Design"
        />
        <SettingsTabButton
          active={tab === "integrations"}
          onClick={() => setTab("integrations")}
          icon={<IconPlug />}
          label="Integrations"
        />
        <SettingsTabButton
          active={tab === "publish"}
          onClick={() => setTab("publish")}
          icon={<IconRocket />}
          label="Publish"
        />
      </nav>

      <div className="rfb-builder-settings__body">
        {tab === "settings" && (
          <SettingsTab
            schema={schema}
            formFields={formFields}
            onSchemaPatch={onSchemaPatch}
            onSettingsPatch={onSettingsPatch}
            onLayoutTypeChange={onLayoutTypeChange}
          />
        )}
        {tab === "design" && (
          <DesignTab schema={schema} onSettingsPatch={onSettingsPatch} />
        )}
        {tab === "integrations" && (
          <IntegrationsTab
            settings={schema.settings}
            formFields={formFields}
            onSettingsPatch={onSettingsPatch}
          />
        )}
        {tab === "publish" && (
          <PublishTab
            schema={schema}
            onReplaceSchema={onReplaceSchema}
            onExportJson={onExportJson}
            onImportJson={onImportJson}
          />
        )}
      </div>
    </div>
  );
}

function SettingsTabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={[
        "rfb-builder-settings__tab",
        active && "rfb-builder-settings__tab--active",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      <span className="rfb-builder-settings__tab-icon" aria-hidden="true">
        {icon}
      </span>
      {label}
    </button>
  );
}

/* ============================================================ */
/*  Settings tab — vertical sub-tabs                            */
/* ============================================================ */

type SettingsSubTab =
  | "general"
  | "layout"
  | "submission"
  | "modal"
  | "meta";

const SETTINGS_SUB_TABS: { id: SettingsSubTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "layout", label: "Layout" },
  { id: "submission", label: "Submission" },
  { id: "modal", label: "Modal" },
  { id: "meta", label: "Meta" },
];

interface SettingsTabProps {
  schema: FormSchema;
  formFields: FormField[];
  onSchemaPatch: (patch: Partial<FormSchema>) => void;
  onSettingsPatch: (patch: Partial<FormSettings>) => void;
  onLayoutTypeChange: (type: LayoutType) => void;
}

function SettingsTab({
  schema,
  formFields,
  onSchemaPatch,
  onSettingsPatch,
  onLayoutTypeChange,
}: SettingsTabProps) {
  const [sub, setSub] = useState<SettingsSubTab>("general");
  const settings: FormSettings = schema.settings ?? {};
  const layoutType: LayoutType = schema.layout?.type ?? "single";

  return (
    <div className="rfb-builder-settings__split">
      <aside className="rfb-builder-settings__side-tabs" role="tablist">
        {SETTINGS_SUB_TABS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={sub === s.id}
            className={[
              "rfb-builder-settings__side-tab",
              sub === s.id && "rfb-builder-settings__side-tab--active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSub(s.id)}
          >
            {s.label}
          </button>
        ))}
      </aside>

      <div className="rfb-builder-settings__panel">
        {sub === "general" && (
          <SettingsSection
            title="General"
            description="Top-level information shown to your users."
          >
            <label className="rfb-builder-properties__field">
              <span>Form title</span>
              <input
                type="text"
                value={schema.title ?? ""}
                placeholder="Untitled form"
                onChange={(e) => onSchemaPatch({ title: e.target.value })}
              />
            </label>
            <label className="rfb-builder-properties__field">
              <span>Description</span>
              <textarea
                rows={3}
                value={schema.description ?? ""}
                placeholder="What is this form about?"
                onChange={(e) => onSchemaPatch({ description: e.target.value })}
              />
            </label>
            <div className="rfb-builder-properties__row">
              <label className="rfb-builder-properties__field">
                <span>Submit button label</span>
                <input
                  type="text"
                  value={settings.submitLabel ?? ""}
                  placeholder="Submit"
                  onChange={(e) =>
                    onSettingsPatch({ submitLabel: e.target.value })
                  }
                />
              </label>
              <label className="rfb-builder-properties__field">
                <span>Cancel button label</span>
                <input
                  type="text"
                  value={settings.cancelLabel ?? ""}
                  placeholder="Cancel"
                  onChange={(e) =>
                    onSettingsPatch({ cancelLabel: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="rfb-builder-properties__row">
              <label className="rfb-builder-properties__field">
                <span>Mode</span>
                <select
                  className="rfb-builder-properties__select"
                  value={settings.mode ?? "add"}
                  onChange={(e) =>
                    onSettingsPatch({
                      mode: e.target.value as "add" | "edit" | "view",
                    })
                  }
                >
                  <option value="add">Add (new submission)</option>
                  <option value="edit">Edit (update existing)</option>
                  <option value="view">View (read-only)</option>
                </select>
              </label>
              <label className="rfb-builder-properties__checkbox">
                <input
                  type="checkbox"
                  checked={settings.rtl === true}
                  onChange={(e) => onSettingsPatch({ rtl: e.target.checked })}
                />
                Right-to-left layout
              </label>
            </div>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={settings.showCancel === true}
                onChange={(e) =>
                  onSettingsPatch({ showCancel: e.target.checked })
                }
              />
              Show cancel button
            </label>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={settings.postOnSubmit !== false}
                onChange={(e) =>
                  onSettingsPatch({ postOnSubmit: e.target.checked })
                }
              />
              Auto-post to server on submit
              <p className="rfb-builder-panel__hint">
                When off, the renderer hands control back to your code so you
                can submit through a custom API.
              </p>
            </label>
          </SettingsSection>
        )}

        {sub === "layout" && (
          <SettingsSection
            title="Layout"
            description="Choose how fields are laid out for the user."
          >
            <div className="rfb-builder-form-settings__layout-options rfb-builder-settings__layout-options">
              {(["single", "steps", "tabs"] as const).map((type) => (
                <label
                  key={type}
                  className={[
                    "rfb-builder-settings__layout-card",
                    layoutType === type &&
                      "rfb-builder-settings__layout-card--active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="rfb-layout-type"
                    value={type}
                    checked={layoutType === type}
                    onChange={() => onLayoutTypeChange(type)}
                  />
                  <strong>
                    {type === "single" && "Single page"}
                    {type === "steps" && "Multi-step"}
                    {type === "tabs" && "Multi-tab"}
                  </strong>
                  <span>
                    {type === "single" &&
                      "All fields on one page. Best for short forms."}
                    {type === "steps" &&
                      "Wizard-style — users move forward through steps."}
                    {type === "tabs" &&
                      "Free navigation between named sections."}
                  </span>
                </label>
              ))}
            </div>
          </SettingsSection>
        )}

        {sub === "submission" && (
          <SettingsSection
            title="After submission"
            description="What the user sees after they submit. Emails &amp; webhooks live under Integrations."
          >
            <SubmissionBehaviorBlock
              settings={settings}
              formFields={formFields}
              onSettingsPatch={onSettingsPatch}
            />
          </SettingsSection>
        )}

        {sub === "modal" && (
          <ModalSettingsPanel
            settings={settings}
            onSettingsPatch={onSettingsPatch}
          />
        )}

        {sub === "meta" && (
          <MetaPanel schema={schema} onSchemaPatch={onSchemaPatch} />
        )}
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rfb-builder-settings__section">
      <header className="rfb-builder-settings__section-header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      <div className="rfb-builder-settings__section-body">{children}</div>
    </section>
  );
}

function ModalSettingsPanel({
  settings,
  onSettingsPatch,
}: {
  settings: FormSettings;
  onSettingsPatch: (patch: Partial<FormSettings>) => void;
}) {
  const enabled = settings.displayAsModal === true;
  const modal: ModalSettings = settings.modal ?? {};

  function patchModal(p: Partial<ModalSettings>) {
    onSettingsPatch({ modal: { ...modal, ...p } });
  }

  return (
    <SettingsSection
      title="Modal display"
      description="Open the form inside a dialog instead of inline."
    >
      <label className="rfb-builder-properties__checkbox">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) =>
            onSettingsPatch({ displayAsModal: e.target.checked })
          }
        />
        Display form as a modal
      </label>

      {enabled && (
        <>
          <div className="rfb-builder-properties__row">
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
                  patchModal({ size: e.target.value as ModalSettings["size"] })
                }
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="fullscreen">Fullscreen</option>
              </select>
            </label>
          </div>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.showTrigger !== false}
              onChange={(e) => patchModal({ showTrigger: e.target.checked })}
            />
            Show built-in trigger button
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
              onChange={(e) => patchModal({ closeOnEscape: e.target.checked })}
            />
            Close on Escape
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.showCloseButton !== false}
              onChange={(e) =>
                patchModal({ showCloseButton: e.target.checked })
              }
            />
            Show close button in header
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.openOnLoad === true}
              onChange={(e) => patchModal({ openOnLoad: e.target.checked })}
            />
            Auto-open modal on page load
          </label>
          <label className="rfb-builder-properties__checkbox">
            <input
              type="checkbox"
              checked={modal.closeOnSubmit !== false}
              onChange={(e) => patchModal({ closeOnSubmit: e.target.checked })}
            />
            Close modal after successful submit
          </label>
        </>
      )}
    </SettingsSection>
  );
}

function MetaPanel({
  schema,
  onSchemaPatch,
}: {
  schema: FormSchema;
  onSchemaPatch: (patch: Partial<FormSchema>) => void;
}) {
  return (
    <SettingsSection
      title="Meta"
      description="Identifiers used by your backend and analytics."
    >
      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Form ID</span>
          <input
            type="text"
            value={schema.id ?? ""}
            onChange={(e) => onSchemaPatch({ id: e.target.value })}
          />
        </label>
        <label className="rfb-builder-properties__field">
          <span>Schema version</span>
          <input
            type="text"
            value={schema.version ?? ""}
            onChange={(e) => onSchemaPatch({ version: e.target.value })}
          />
        </label>
      </div>
      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Created at</span>
          <input
            type="text"
            value={schema.createdAt ?? ""}
            placeholder="ISO timestamp"
            onChange={(e) =>
              onSchemaPatch({ createdAt: e.target.value || undefined })
            }
          />
        </label>
        <label className="rfb-builder-properties__field">
          <span>Updated at</span>
          <input
            type="text"
            value={schema.updatedAt ?? ""}
            placeholder="ISO timestamp"
            onChange={(e) =>
              onSchemaPatch({ updatedAt: e.target.value || undefined })
            }
          />
        </label>
      </div>
      <p className="rfb-builder-panel__hint">
        Additional <code>metadata</code> on the schema is preserved when you
        export / import JSON — useful for tagging, A/B variants, or analytics
        IDs.
      </p>
    </SettingsSection>
  );
}

/* ============================================================ */
/*  Design tab                                                  */
/* ============================================================ */

function DesignTab({
  schema,
  onSettingsPatch,
}: {
  schema: FormSchema;
  onSettingsPatch: (patch: Partial<FormSettings>) => void;
}) {
  const settings = schema.settings ?? {};
  return (
    <div className="rfb-builder-settings__panel rfb-builder-settings__panel--single">
      <SettingsSection
        title="Theme"
        description="Pick a built-in theme or use your own. Custom themes can be registered via @rfb-ddt/themes."
      >
        <div className="rfb-builder-settings__theme-grid">
          {(["default", "rounded", "material", "minimal"] as const).map(
            (themeId) => (
              <label
                key={themeId}
                className={[
                  "rfb-builder-settings__theme-card",
                  (settings.theme ?? "default") === themeId &&
                    "rfb-builder-settings__theme-card--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="rfb-theme"
                  value={themeId}
                  checked={(settings.theme ?? "default") === themeId}
                  onChange={() => onSettingsPatch({ theme: themeId })}
                />
                <span className="rfb-builder-settings__theme-swatch" data-theme={themeId} />
                <strong>{prettyTheme(themeId)}</strong>
                <em>{themeBlurb(themeId)}</em>
              </label>
            ),
          )}
        </div>
        <p className="rfb-builder-panel__hint">
          Theme support is design-token based and is wired up in the renderer
          via CSS variables. Custom themes can be added by registering with
          <code> ThemeRegistry</code>.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Root class &amp; CSS"
        description="Hook your own stylesheet into the rendered form."
      >
        <label className="rfb-builder-properties__field">
          <span>Form className</span>
          <input
            type="text"
            value={settings.className ?? ""}
            placeholder="my-form contact"
            onChange={(e) =>
              onSettingsPatch({ className: e.target.value || undefined })
            }
          />
          <p className="rfb-builder-panel__hint">
            Space-separated classes applied to the form's root element. Scope
            your CSS under this class to avoid leaking styles.
          </p>
        </label>
      </SettingsSection>

      <SettingsSection
        title="Coming soon"
        description="Planned design controls."
      >
        <ul className="rfb-builder-settings__planned">
          <li>Primary / accent colour pickers</li>
          <li>Font family &amp; base size</li>
          <li>Spacing density (compact / cozy / comfortable)</li>
          <li>Per-field style overrides</li>
        </ul>
      </SettingsSection>
    </div>
  );
}

function prettyTheme(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}
function themeBlurb(id: string): string {
  switch (id) {
    case "default":
      return "Clean, neutral defaults.";
    case "rounded":
      return "Soft corners, friendly feel.";
    case "material":
      return "Material-style filled inputs.";
    case "minimal":
      return "Underline inputs, lots of whitespace.";
    default:
      return "";
  }
}

/* ============================================================ */
/*  Integrations tab                                            */
/* ============================================================ */

type IntegrationsSubTab = "email" | "webhooks" | "more";

function IntegrationsTab({
  settings,
  formFields,
  onSettingsPatch,
}: {
  settings: FormSettings | undefined;
  formFields: FormField[];
  onSettingsPatch: (patch: Partial<FormSettings>) => void;
}) {
  const [sub, setSub] = useState<IntegrationsSubTab>("email");
  const emailCount = settings?.submission?.emailNotifications?.length ?? 0;
  const webhookCount = settings?.submission?.webhooks?.length ?? 0;

  return (
    <div className="rfb-builder-settings__split">
      <aside className="rfb-builder-settings__side-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={sub === "email"}
          className={[
            "rfb-builder-settings__side-tab",
            sub === "email" && "rfb-builder-settings__side-tab--active",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setSub("email")}
        >
          Email
          <span className="rfb-builder-settings__side-tab-count">
            {emailCount}
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sub === "webhooks"}
          className={[
            "rfb-builder-settings__side-tab",
            sub === "webhooks" && "rfb-builder-settings__side-tab--active",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setSub("webhooks")}
        >
          Webhooks
          <span className="rfb-builder-settings__side-tab-count">
            {webhookCount}
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sub === "more"}
          className={[
            "rfb-builder-settings__side-tab",
            sub === "more" && "rfb-builder-settings__side-tab--active",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setSub("more")}
        >
          More
        </button>
      </aside>

      <div className="rfb-builder-settings__panel">
        {sub === "email" && (
          <SettingsSection
            title="Email notifications"
            description="Configure who gets notified after a successful submit. Your backend dispatches these — the renderer just carries the config."
          >
            <EmailNotificationsEditor
              settings={settings}
              formFields={formFields}
              onSettingsPatch={onSettingsPatch}
            />
          </SettingsSection>
        )}
        {sub === "webhooks" && (
          <SettingsSection
            title="Webhooks"
            description="POST submissions to any endpoint — Zapier, Make, n8n, or your own service."
          >
            <WebhooksEditor
              settings={settings}
              formFields={formFields}
              onSettingsPatch={onSettingsPatch}
            />
          </SettingsSection>
        )}
        {sub === "more" && (
          <SettingsSection
            title="More integrations"
            description="Native connectors for popular services. Coming soon."
          >
            <div className="rfb-builder-settings__integration-grid">
              {[
                "Zapier",
                "Make.com",
                "Slack",
                "Microsoft Teams",
                "Google Sheets",
                "Airtable",
                "HubSpot",
                "Mailchimp",
                "Stripe",
              ].map((name) => (
                <div
                  key={name}
                  className="rfb-builder-settings__integration-card"
                >
                  <span className="rfb-builder-settings__integration-badge">
                    Soon
                  </span>
                  <strong>{name}</strong>
                </div>
              ))}
            </div>
            <p className="rfb-builder-panel__hint">
              For now you can connect any of these via the Webhooks tab —
              every service above accepts inbound webhooks.
            </p>
          </SettingsSection>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Publish tab                                                 */
/* ============================================================ */

function PublishTab({
  schema,
  onReplaceSchema,
  onExportJson,
  onImportJson,
}: {
  schema: FormSchema;
  onReplaceSchema: (next: FormSchema) => void;
  onExportJson: () => void;
  onImportJson: () => void;
}) {
  const [shareUrl, setShareUrl] = useState<string>(
    () => `https://forms.example.com/${schema.id || "untitled"}`,
  );

  const embedScript = `<script src="https://cdn.example.com/rfb-ddt.min.js"></script>
<div id="my-form"></div>
<script>
  RFB.mount('#my-form', ${JSON.stringify({ formId: schema.id }, null, 2)});
</script>`;

  const embedIframe = `<iframe
  src="${shareUrl}"
  width="100%"
  height="640"
  frameborder="0"
  title="${schema.title || "Form"}"
></iframe>`;

  function copy(text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        /* clipboard blocked — fall through */
      });
    }
  }

  return (
    <div className="rfb-builder-settings__panel rfb-builder-settings__panel--single">
      <SettingsSection
        title="Status"
        description="Forms start as drafts. Publishing exposes them to the public URL."
      >
        <div className="rfb-builder-settings__status">
          <span className="rfb-builder-settings__status-pill rfb-builder-settings__status-pill--draft">
            Draft
          </span>
          <button type="button" className="rfb-builder__primary-btn">
            <IconRocket /> Publish form
          </button>
          <p className="rfb-builder-panel__hint">
            (Status persistence requires a backend; this is a placeholder until
            the SaaS layer is wired up.)
          </p>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Share link"
        description="Direct URL that anyone can fill in."
      >
        <div className="rfb-builder-properties__row rfb-builder-settings__share-row">
          <input
            type="text"
            value={shareUrl}
            onChange={(e) => setShareUrl(e.target.value)}
            className="rfb-builder-settings__share-input"
          />
          <button
            type="button"
            className="rfb-builder__icon-btn"
            onClick={() => copy(shareUrl)}
            title="Copy link"
            aria-label="Copy link"
          >
            <IconShare />
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Embed"
        description="Drop the form into any site."
      >
        <div className="rfb-builder-settings__embed">
          <div className="rfb-builder-settings__embed-header">
            <strong>iframe</strong>
            <button
              type="button"
              className="rfb-builder__icon-btn"
              onClick={() => copy(embedIframe)}
              title="Copy iframe"
              aria-label="Copy iframe"
            >
              <IconCode />
            </button>
          </div>
          <pre className="rfb-builder-settings__embed-code">{embedIframe}</pre>
        </div>
        <div className="rfb-builder-settings__embed">
          <div className="rfb-builder-settings__embed-header">
            <strong>JavaScript snippet</strong>
            <button
              type="button"
              className="rfb-builder__icon-btn"
              onClick={() => copy(embedScript)}
              title="Copy script"
              aria-label="Copy script"
            >
              <IconCode />
            </button>
          </div>
          <pre className="rfb-builder-settings__embed-code">{embedScript}</pre>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Export / Import schema"
        description="The form definition is plain JSON — version it in git, send it to your backend, or hand-edit it."
      >
        <div className="rfb-builder-settings__export-row">
          <button
            type="button"
            className="rfb-builder__icon-btn rfb-builder-settings__export-btn"
            onClick={onExportJson}
          >
            <IconDownload /> Export JSON
          </button>
          <button
            type="button"
            className="rfb-builder__icon-btn rfb-builder-settings__export-btn"
            onClick={onImportJson}
          >
            <IconCode /> Paste JSON
          </button>
          <button
            type="button"
            className="rfb-builder__icon-btn rfb-builder-settings__export-btn"
            onClick={() => {
              const next: FormSchema = {
                ...schema,
                id: `${schema.id || "form"}-copy`,
                title: `${schema.title || "Untitled form"} (copy)`,
              };
              onReplaceSchema(next);
            }}
          >
            <IconShare /> Duplicate
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Coming soon"
        description="Planned publish options."
      >
        <ul className="rfb-builder-settings__planned">
          <li>
            <IconMobile /> QR code generation
          </li>
          <li>
            <IconTablet /> Email-a-link
          </li>
          <li>
            <IconDesktop /> Domain &amp; custom URL slugs
          </li>
          <li>
            <IconCode /> Submission analytics
          </li>
        </ul>
      </SettingsSection>
    </div>
  );
}
