import type {
  EmailNotification,
  ErrorMessage,
  FormField,
  FormSettings,
  SubmissionCondition,
  SubmissionSettings,
  SuccessMessage,
  SuccessRedirect,
  WebhookConfig,
} from "@rfb-ddt/schema";
import { useMemo, useState } from "react";
import { IconChevronDown, IconPlus, IconTrash } from "../icons.js";

/* ------------------------------------------------------------------ */
/*  Shared types + utils                                              */
/* ------------------------------------------------------------------ */

export interface SubmissionEditorProps {
  settings: FormSettings | undefined;
  formFields: FormField[];
  onSettingsPatch: (patch: Partial<FormSettings>) => void;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function patchSubmission(
  settings: FormSettings | undefined,
  onSettingsPatch: SubmissionEditorProps["onSettingsPatch"],
  patch: Partial<SubmissionSettings>,
) {
  const current = settings?.submission ?? {};
  onSettingsPatch({ submission: { ...current, ...patch } });
}

/* ------------------------------------------------------------------ */
/*  Behaviour block — success / redirect / error / reset              */
/* ------------------------------------------------------------------ */

/**
 * The client-side behaviour after a submit (success view, redirect, error
 * view, reset). Lives in the Settings tab — these are core form behaviours.
 */
export function SubmissionBehaviorBlock({
  settings,
  formFields,
  onSettingsPatch,
}: SubmissionEditorProps) {
  const submission: SubmissionSettings = settings?.submission ?? {};
  const successMessage = submission.successMessage;
  const successRedirect = submission.successRedirect;
  const errorMessage = submission.errorMessage;
  const resetAfter = submission.resetAfterSubmit !== false;

  const fieldNames = useMemo(
    () => formFields.map((f) => f.name).filter(Boolean),
    [formFields],
  );

  function patch(p: Partial<SubmissionSettings>) {
    patchSubmission(settings, onSettingsPatch, p);
  }

  function toggleSuccessMessage(enabled: boolean) {
    if (enabled) {
      patch({
        successMessage: successMessage ?? {
          title: "Thank you!",
          body: "We received your submission.",
          showSubmitAgain: true,
        },
      });
    } else {
      patch({ successMessage: undefined });
    }
  }

  function toggleRedirect(enabled: boolean) {
    if (enabled) {
      patch({
        successRedirect: successRedirect ?? {
          url: "",
          delay: 1500,
          openInNewTab: false,
        },
      });
    } else {
      patch({ successRedirect: undefined });
    }
  }

  function toggleErrorMessage(enabled: boolean) {
    if (enabled) {
      patch({
        errorMessage: errorMessage ?? {
          title: "Something went wrong",
          body: "Please try again. If the problem persists, contact support.",
          showRetry: true,
        },
      });
    } else {
      patch({ errorMessage: undefined });
    }
  }

  function patchSuccess(p: Partial<SuccessMessage>) {
    patch({ successMessage: { ...(successMessage ?? { body: "" }), ...p } });
  }
  function patchRedirect(p: Partial<SuccessRedirect>) {
    patch({ successRedirect: { ...(successRedirect ?? { url: "" }), ...p } });
  }
  function patchError(p: Partial<ErrorMessage>) {
    patch({ errorMessage: { ...(errorMessage ?? { body: "" }), ...p } });
  }

  return (
    <div className="rfb-builder-submission">
      <CollapsibleRow
        title="Show success message"
        enabled={!!successMessage}
        onToggle={toggleSuccessMessage}
      >
        {successMessage && (
          <>
            <label className="rfb-builder-properties__field">
              <span>Title</span>
              <input
                type="text"
                value={successMessage.title ?? ""}
                placeholder="Thank you!"
                onChange={(e) =>
                  patchSuccess({ title: e.target.value || undefined })
                }
              />
            </label>
            <label className="rfb-builder-properties__field">
              <span>Body</span>
              <textarea
                rows={3}
                value={successMessage.body}
                placeholder="We received your submission. Use {name} to insert field values."
                onChange={(e) => patchSuccess({ body: e.target.value })}
              />
            </label>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={successMessage.showSubmitAgain !== false}
                onChange={(e) =>
                  patchSuccess({ showSubmitAgain: e.target.checked })
                }
              />
              Show "Submit another response" button
            </label>
            {successMessage.showSubmitAgain !== false && (
              <label className="rfb-builder-properties__field">
                <span>Button label</span>
                <input
                  type="text"
                  value={successMessage.submitAgainLabel ?? ""}
                  placeholder="Submit another response"
                  onChange={(e) =>
                    patchSuccess({
                      submitAgainLabel: e.target.value || undefined,
                    })
                  }
                />
              </label>
            )}
            <TokenHint fieldNames={fieldNames} />
          </>
        )}
      </CollapsibleRow>

      <CollapsibleRow
        title="Redirect to URL"
        enabled={!!successRedirect}
        onToggle={toggleRedirect}
      >
        {successRedirect && (
          <>
            <label className="rfb-builder-properties__field">
              <span>URL</span>
              <input
                type="text"
                value={successRedirect.url}
                placeholder="https://example.com/thanks?email={email}"
                onChange={(e) => patchRedirect({ url: e.target.value })}
              />
            </label>
            <div className="rfb-builder-properties__row">
              <label className="rfb-builder-properties__field">
                <span>Delay (ms)</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={successRedirect.delay ?? 0}
                  onChange={(e) =>
                    patchRedirect({
                      delay: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </label>
              <label className="rfb-builder-properties__checkbox">
                <input
                  type="checkbox"
                  checked={!!successRedirect.openInNewTab}
                  onChange={(e) =>
                    patchRedirect({ openInNewTab: e.target.checked })
                  }
                />
                Open in new tab
              </label>
            </div>
            <p className="rfb-builder-panel__hint">
              When both a success message and a redirect are enabled, the
              message is shown first then the browser navigates after the
              delay.
            </p>
          </>
        )}
      </CollapsibleRow>

      <label className="rfb-builder-properties__checkbox">
        <input
          type="checkbox"
          checked={resetAfter}
          onChange={(e) => patch({ resetAfterSubmit: e.target.checked })}
        />
        Reset form values after submit
      </label>

      <CollapsibleRow
        title="Custom error message"
        enabled={!!errorMessage}
        onToggle={toggleErrorMessage}
      >
        {errorMessage && (
          <>
            <label className="rfb-builder-properties__field">
              <span>Title</span>
              <input
                type="text"
                value={errorMessage.title ?? ""}
                placeholder="Something went wrong"
                onChange={(e) =>
                  patchError({ title: e.target.value || undefined })
                }
              />
            </label>
            <label className="rfb-builder-properties__field">
              <span>Body</span>
              <textarea
                rows={3}
                value={errorMessage.body}
                placeholder="Please try again. If the problem persists, contact support."
                onChange={(e) => patchError({ body: e.target.value })}
              />
            </label>
            <label className="rfb-builder-properties__checkbox">
              <input
                type="checkbox"
                checked={errorMessage.showRetry !== false}
                onChange={(e) => patchError({ showRetry: e.target.checked })}
              />
              Show "Try again" button
            </label>
          </>
        )}
      </CollapsibleRow>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Email notifications editor                                         */
/* ------------------------------------------------------------------ */

export function EmailNotificationsEditor({
  settings,
  formFields,
  onSettingsPatch,
}: SubmissionEditorProps) {
  const submission: SubmissionSettings = settings?.submission ?? {};
  const emails = submission.emailNotifications ?? [];
  const fieldNames = useMemo(
    () => formFields.map((f) => f.name).filter(Boolean),
    [formFields],
  );

  function patch(next: EmailNotification[]) {
    patchSubmission(settings, onSettingsPatch, {
      emailNotifications: next,
    });
  }

  function addEmail() {
    patch([
      ...emails,
      { id: makeId("email"), to: "", subject: "", body: "" },
    ]);
  }

  function updateEmail(id: string, p: Partial<EmailNotification>) {
    patch(emails.map((e) => (e.id === id ? { ...e, ...p } : e)));
  }

  function removeEmail(id: string) {
    patch(emails.filter((e) => e.id !== id));
  }

  return (
    <div className="rfb-builder-submission rfb-builder-submission--inline">
      {emails.length === 0 && (
        <p className="rfb-builder-panel__hint">
          No email notifications configured. Add one below to email the team
          (or the submitter) when a form is submitted.
        </p>
      )}
      {emails.map((email, index) => (
        <EmailEditor
          key={email.id}
          email={email}
          index={index}
          fieldNames={fieldNames}
          onChange={(p) => updateEmail(email.id, p)}
          onRemove={() => removeEmail(email.id)}
        />
      ))}
      <button
        type="button"
        className="rfb-builder-properties__option-add"
        onClick={addEmail}
      >
        <IconPlus /> Add email notification
      </button>
      <p className="rfb-builder-panel__hint">
        These configurations travel with the schema. Your backend (SaaS API or
        WordPress plugin) reads <code>schema.settings.submission.emailNotifications</code>
        and dispatches the emails after a successful submit.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Webhooks editor                                                    */
/* ------------------------------------------------------------------ */

export function WebhooksEditor({
  settings,
  formFields,
  onSettingsPatch,
}: SubmissionEditorProps) {
  const submission: SubmissionSettings = settings?.submission ?? {};
  const webhooks = submission.webhooks ?? [];
  const fieldNames = useMemo(
    () => formFields.map((f) => f.name).filter(Boolean),
    [formFields],
  );

  function patch(next: WebhookConfig[]) {
    patchSubmission(settings, onSettingsPatch, { webhooks: next });
  }

  function addWebhook() {
    patch([
      ...webhooks,
      {
        id: makeId("webhook"),
        url: "",
        method: "POST",
        failOpen: true,
      },
    ]);
  }

  function updateWebhook(id: string, p: Partial<WebhookConfig>) {
    patch(webhooks.map((w) => (w.id === id ? { ...w, ...p } : w)));
  }

  function removeWebhook(id: string) {
    patch(webhooks.filter((w) => w.id !== id));
  }

  return (
    <div className="rfb-builder-submission rfb-builder-submission--inline">
      {webhooks.length === 0 && (
        <p className="rfb-builder-panel__hint">
          No webhooks configured. Add one below to POST the response to a
          custom endpoint (Zapier, Make, your own service, etc.).
        </p>
      )}
      {webhooks.map((webhook, index) => (
        <WebhookEditor
          key={webhook.id}
          webhook={webhook}
          index={index}
          fieldNames={fieldNames}
          onChange={(p) => updateWebhook(webhook.id, p)}
          onRemove={() => removeWebhook(webhook.id)}
        />
      ))}
      <button
        type="button"
        className="rfb-builder-properties__option-add"
        onClick={addWebhook}
      >
        <IconPlus /> Add webhook
      </button>
      <p className="rfb-builder-panel__hint">
        Webhooks are POSTed by your backend after a successful submit. The
        renderer never calls them directly.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal building blocks                                           */
/* ------------------------------------------------------------------ */

interface CollapsibleRowProps {
  title: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
}

function CollapsibleRow({
  title,
  enabled,
  onToggle,
  children,
}: CollapsibleRowProps) {
  return (
    <div
      className={`rfb-builder-submission__row${enabled ? " rfb-builder-submission__row--open" : ""}`}
    >
      <label className="rfb-builder-submission__row-toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>{title}</span>
      </label>
      {enabled && (
        <div className="rfb-builder-submission__row-body">{children}</div>
      )}
    </div>
  );
}

interface EmailEditorProps {
  email: EmailNotification;
  index: number;
  fieldNames: string[];
  onChange: (patch: Partial<EmailNotification>) => void;
  onRemove: () => void;
}

function EmailEditor({
  email,
  index,
  fieldNames,
  onChange,
  onRemove,
}: EmailEditorProps) {
  return (
    <div className="rfb-builder-submission__card">
      <header className="rfb-builder-submission__card-header">
        <span className="rfb-builder-submission__card-title">
          Email #{index + 1}
        </span>
        <button
          type="button"
          className="rfb-builder-properties__delete-icon"
          onClick={onRemove}
          aria-label="Remove email"
          title="Remove email"
        >
          <IconTrash />
        </button>
      </header>

      <label className="rfb-builder-properties__field">
        <span>To</span>
        <input
          type="text"
          value={email.to}
          placeholder="ops@example.com or {email}"
          onChange={(e) => onChange({ to: e.target.value })}
        />
      </label>
      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>CC</span>
          <input
            type="text"
            value={email.cc ?? ""}
            placeholder="optional"
            onChange={(e) => onChange({ cc: e.target.value || undefined })}
          />
        </label>
        <label className="rfb-builder-properties__field">
          <span>BCC</span>
          <input
            type="text"
            value={email.bcc ?? ""}
            placeholder="optional"
            onChange={(e) => onChange({ bcc: e.target.value || undefined })}
          />
        </label>
      </div>
      <label className="rfb-builder-properties__field">
        <span>Subject</span>
        <input
          type="text"
          value={email.subject}
          placeholder="New submission from {firstName}"
          onChange={(e) => onChange({ subject: e.target.value })}
        />
      </label>
      <label className="rfb-builder-properties__field">
        <span>Body</span>
        <textarea
          rows={5}
          value={email.body}
          placeholder={`Hello,\n\nA new response was submitted:\n  Name: {firstName} {lastName}\n  Email: {email}\n  Message: {message}`}
          onChange={(e) => onChange({ body: e.target.value })}
        />
      </label>
      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Reply-to</span>
          <input
            type="text"
            value={email.replyTo ?? ""}
            placeholder="{email}"
            onChange={(e) =>
              onChange({ replyTo: e.target.value || undefined })
            }
          />
        </label>
        <label className="rfb-builder-properties__field">
          <span>From name</span>
          <input
            type="text"
            value={email.fromName ?? ""}
            placeholder="Acme Forms"
            onChange={(e) =>
              onChange({ fromName: e.target.value || undefined })
            }
          />
        </label>
      </div>
      <ConditionEditor
        condition={email.when}
        fieldNames={fieldNames}
        onChange={(when) => onChange({ when })}
      />
      <TokenHint fieldNames={fieldNames} />
    </div>
  );
}

interface WebhookEditorProps {
  webhook: WebhookConfig;
  index: number;
  fieldNames: string[];
  onChange: (patch: Partial<WebhookConfig>) => void;
  onRemove: () => void;
}

function WebhookEditor({
  webhook,
  index,
  fieldNames,
  onChange,
  onRemove,
}: WebhookEditorProps) {
  const headersText = useMemo(() => {
    if (!webhook.headers) return "";
    return Object.entries(webhook.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }, [webhook.headers]);

  function setHeadersFromText(text: string) {
    const headers: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const idx = trimmed.indexOf(":");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (key) headers[key] = value;
    }
    onChange({ headers: Object.keys(headers).length ? headers : undefined });
  }

  return (
    <div className="rfb-builder-submission__card">
      <header className="rfb-builder-submission__card-header">
        <span className="rfb-builder-submission__card-title">
          Webhook #{index + 1}
        </span>
        <button
          type="button"
          className="rfb-builder-properties__delete-icon"
          onClick={onRemove}
          aria-label="Remove webhook"
          title="Remove webhook"
        >
          <IconTrash />
        </button>
      </header>
      <label className="rfb-builder-properties__field">
        <span>URL</span>
        <input
          type="url"
          value={webhook.url}
          placeholder="https://hooks.example.com/forms"
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </label>
      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Method</span>
          <select
            className="rfb-builder-properties__select"
            value={webhook.method ?? "POST"}
            onChange={(e) =>
              onChange({
                method: e.target.value as "POST" | "PUT" | "PATCH",
              })
            }
          >
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </select>
        </label>
        <label className="rfb-builder-properties__field">
          <span>Content-Type</span>
          <input
            type="text"
            value={webhook.contentType ?? ""}
            placeholder="application/json"
            onChange={(e) =>
              onChange({ contentType: e.target.value || undefined })
            }
          />
        </label>
      </div>
      <label className="rfb-builder-properties__field">
        <span>Headers (one per line, key: value)</span>
        <textarea
          rows={2}
          defaultValue={headersText}
          placeholder={"Authorization: Bearer …\nX-Custom: …"}
          onBlur={(e) => setHeadersFromText(e.target.value)}
        />
      </label>
      <label className="rfb-builder-properties__field">
        <span>Payload template (leave empty for raw response)</span>
        <textarea
          rows={4}
          value={webhook.payload ?? ""}
          placeholder={`{\n  "name": "{firstName} {lastName}",\n  "email": "{email}"\n}`}
          spellCheck={false}
          onChange={(e) => onChange({ payload: e.target.value || undefined })}
        />
      </label>
      <div className="rfb-builder-properties__row">
        <label className="rfb-builder-properties__field">
          <span>Retries</span>
          <input
            type="number"
            min={0}
            max={5}
            value={webhook.retries ?? 0}
            onChange={(e) =>
              onChange({
                retries: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
              })
            }
          />
        </label>
        <label className="rfb-builder-properties__checkbox">
          <input
            type="checkbox"
            checked={webhook.failOpen !== false}
            onChange={(e) => onChange({ failOpen: e.target.checked })}
          />
          Fail open (don't block the user on errors)
        </label>
      </div>
      <ConditionEditor
        condition={webhook.when}
        fieldNames={fieldNames}
        onChange={(when) => onChange({ when })}
      />
      <TokenHint fieldNames={fieldNames} />
    </div>
  );
}

interface ConditionEditorProps {
  condition: SubmissionCondition | undefined;
  fieldNames: string[];
  onChange: (next: SubmissionCondition | undefined) => void;
}

function ConditionEditor({
  condition,
  fieldNames,
  onChange,
}: ConditionEditorProps) {
  const enabled = !!condition;
  const needsValue =
    condition?.operator !== "empty" && condition?.operator !== "notEmpty";

  function toggle(checked: boolean) {
    if (checked) {
      onChange({
        fieldName: fieldNames[0] ?? "",
        operator: "equals",
        value: "",
      });
    } else {
      onChange(undefined);
    }
  }

  return (
    <div className="rfb-builder-submission__condition">
      <label className="rfb-builder-properties__checkbox">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => toggle(e.target.checked)}
        />
        Only send when…
      </label>
      {enabled && condition && (
        <div className="rfb-builder-actions__when-row">
          <select
            className="rfb-builder-properties__select"
            value={condition.fieldName}
            onChange={(e) =>
              onChange({ ...condition, fieldName: e.target.value })
            }
          >
            <option value="">— select field —</option>
            {fieldNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select
            className="rfb-builder-properties__select"
            value={condition.operator}
            onChange={(e) =>
              onChange({
                ...condition,
                operator: e.target.value as SubmissionCondition["operator"],
              })
            }
          >
            <option value="equals">equals</option>
            <option value="notEquals">does not equal</option>
            <option value="contains">contains</option>
            <option value="empty">is empty</option>
            <option value="notEmpty">is not empty</option>
          </select>
          {needsValue && (
            <input
              type="text"
              placeholder="value"
              value={String(condition.value ?? "")}
              onChange={(e) =>
                onChange({ ...condition, value: e.target.value })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

function TokenHint({ fieldNames }: { fieldNames: string[] }) {
  if (fieldNames.length === 0) return null;
  return (
    <p className="rfb-builder-panel__hint rfb-builder-submission__tokens">
      Tokens:{" "}
      {fieldNames.slice(0, 6).map((n, i) => (
        <code key={n}>
          {i > 0 && " "}
          {`{${n}}`}
        </code>
      ))}
      {fieldNames.length > 6 && <em> + {fieldNames.length - 6} more</em>}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Re-export of the legacy combined block (kept for backwards compat)*/
/* ------------------------------------------------------------------ */

/**
 * @deprecated Use {@link SubmissionBehaviorBlock} +
 * {@link EmailNotificationsEditor} + {@link WebhooksEditor} directly.
 * Retained so existing imports keep working.
 */
export function SubmissionSettingsBlock(props: SubmissionEditorProps) {
  return (
    <fieldset className="rfb-builder-form-settings__layout rfb-builder-submission">
      <legend>After submission</legend>
      <SubmissionBehaviorBlock {...props} />
      <ListSection
        title="Email notifications"
        count={props.settings?.submission?.emailNotifications?.length ?? 0}
      >
        <EmailNotificationsEditor {...props} />
      </ListSection>
      <ListSection
        title="Webhooks"
        count={props.settings?.submission?.webhooks?.length ?? 0}
      >
        <WebhooksEditor {...props} />
      </ListSection>
    </fieldset>
  );
}

function ListSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(count > 0);
  return (
    <div
      className={`rfb-builder-submission__list${open ? " rfb-builder-submission__list--open" : ""}`}
    >
      <button
        type="button"
        className="rfb-builder-submission__list-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span
          className="rfb-builder-submission__list-chevron"
          aria-hidden="true"
        >
          <IconChevronDown />
        </span>
        <span className="rfb-builder-submission__list-title">{title}</span>
        <span className="rfb-builder-submission__list-count">{count}</span>
      </button>
      {open && (
        <div className="rfb-builder-submission__list-body">{children}</div>
      )}
    </div>
  );
}
