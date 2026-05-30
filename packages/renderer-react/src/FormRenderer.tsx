import { interpolate } from "@rfb-ddt/core";
import { BasicField } from "@rfb-ddt/field-pack-basic";
import "@rfb-ddt/field-pack-basic/styles.css";
import type {
  ErrorMessage,
  FormResponse,
  SuccessMessage,
  SuccessRedirect,
} from "@rfb-ddt/schema";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { FormModal } from "./FormModal.js";
import "./styles/renderer.css";
import type { FormRendererProps } from "./types.js";
import { useFormRenderer } from "./useFormRenderer.js";

type Phase =
  | { kind: "form" }
  | { kind: "success"; values: Record<string, unknown>; message: SuccessMessage | null; redirect: SuccessRedirect | null }
  | { kind: "error"; message: ErrorMessage; errors: Record<string, string> };

/**
 * Public form renderer. When `schema.settings.displayAsModal` is true,
 * the form is rendered behind a trigger button and opens inside a modal.
 * Otherwise, it renders inline.
 */
export function FormRenderer(props: FormRendererProps) {
  const isModal = props.schema.settings?.displayAsModal === true;
  if (!isModal) return <FormBody {...props} />;
  return <ModalFormRenderer {...props} />;
}

/* ---------- Modal wrapper ---------- */

function ModalFormRenderer(props: FormRendererProps) {
  const {
    schema,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    onSubmitSuccess,
    ...rest
  } = props;
  const modalCfg = schema.settings?.modal ?? {};

  const [internalOpen, setInternalOpen] = useState<boolean>(
    modalCfg.openOnLoad ?? defaultOpen ?? false,
  );

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? !!controlledOpen : internalOpen;

  function setOpen(next: boolean) {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function handleSubmitSuccess(response: FormResponse) {
    onSubmitSuccess?.(response);
    if (modalCfg.closeOnSubmit !== false) {
      // Give the user a moment to see the success view (or the redirect to
      // kick off) before closing the modal.
      const successMessage = schema.settings?.submission?.successMessage;
      const delay = successMessage ? 1500 : 250;
      setTimeout(() => setOpen(false), delay);
    }
  }

  const triggerLabel = modalCfg.triggerLabel ?? schema.title ?? "Open form";
  const showTrigger = modalCfg.showTrigger !== false;

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          className="rfb-modal-trigger rfb-renderer__button rfb-renderer__button--primary"
          onClick={() => setOpen(true)}
        >
          {triggerLabel}
        </button>
      )}
      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        title={schema.title}
        description={schema.description}
        size={modalCfg.size}
        closeOnBackdrop={modalCfg.closeOnBackdrop !== false}
        closeOnEscape={modalCfg.closeOnEscape !== false}
        showCloseButton={modalCfg.showCloseButton !== false}
      >
        <FormBody
          schema={schema}
          {...rest}
          showHeader={false}
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={() => {
            rest.onCancel?.();
            setOpen(false);
          }}
        />
      </FormModal>
    </>
  );
}

/* ---------- Form body (the actual <form>) ---------- */

function FormBody({
  schema,
  initialValues,
  className,
  fieldRegistry,
  showHeader = true,
  showActions = true,
  registerBuiltins,
  onChange,
  onSubmit,
  onSubmitSuccess,
  onSubmitError,
  onCancel,
}: FormRendererProps) {
  const form = useFormRenderer({
    schema,
    initialValues,
    fieldRegistry,
    registerBuiltins,
    onChange,
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "form" });
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submission = schema.settings?.submission;

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const {
    values,
    errors,
    fields,
    readOnly,
    currentPageIndex,
    pageCount,
    layoutType,
    setValue,
    validateField,
    nextPage,
    previousPage,
    goToPage,
    submit,
    reset,
  } = form;

  const isMultiPage = layoutType !== "single" && pageCount > 1;
  const isLastPage = currentPageIndex >= pageCount - 1;
  const isFirstPage = currentPageIndex === 0;
  const currentPage = schema.layout?.pages?.[currentPageIndex];

  const scheduleRedirect = useCallback(
    (cfg: SuccessRedirect, submitted: Record<string, unknown>) => {
      const url = interpolate(cfg.url, submitted);
      if (!url) return;
      const delay = Math.max(0, cfg.delay ?? 0);
      const go = () => {
        if (typeof window === "undefined") return;
        if (cfg.openInNewTab) window.open(url, "_blank", "noopener");
        else window.location.assign(url);
      };
      if (delay === 0) {
        go();
      } else {
        redirectTimerRef.current = setTimeout(go, delay);
      }
    },
    [],
  );

  const handleSubmitAgain = useCallback(() => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    reset();
    setPhase({ kind: "form" });
    setStatusMessage(null);
  }, [reset]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatusMessage(null);

    if (isMultiPage && layoutType === "steps" && !isLastPage) {
      const advanced = nextPage();
      if (!advanced) {
        setStatusMessage("Please fix the errors on this step.");
        onSubmitError?.(form.errors);
      }
      return;
    }

    const result = await submit();
    await onSubmit?.(result);

    if (!result.ok) {
      if (result.cancelled) {
        setStatusMessage(result.reason ?? "Submission cancelled.");
        return;
      }
      onSubmitError?.(form.errors);
      if (submission?.errorMessage) {
        setPhase({
          kind: "error",
          message: submission.errorMessage,
          errors: form.errors,
        });
      } else {
        setStatusMessage("Please fix the errors below.");
      }
      return;
    }

    if (result.response) {
      onSubmitSuccess?.(result.response);
      const submittedValues = result.response.data ?? values;
      const successMessage = submission?.successMessage ?? null;
      const successRedirect = submission?.successRedirect ?? null;
      const shouldReset = submission?.resetAfterSubmit !== false;

      if (successMessage || successRedirect) {
        setPhase({
          kind: "success",
          values: submittedValues,
          message: successMessage,
          redirect: successRedirect,
        });
      } else {
        setStatusMessage("Submitted successfully.");
      }

      if (shouldReset && !successRedirect) {
        // Reset values but stay on the success view. If we're redirecting, we
        // leave the values alone (the page is about to navigate away anyway).
        // The next render of the form view (after "Submit again") will reset.
      }

      if (successRedirect) {
        scheduleRedirect(successRedirect, submittedValues);
      }
    }
  }

  function handlePrevious() {
    setStatusMessage(null);
    previousPage();
  }

  const rootClass = ["rfb-renderer", className].filter(Boolean).join(" ");

  /* ---------- Success view ---------- */
  if (phase.kind === "success" && phase.message) {
    const msg = phase.message;
    const title = msg.title ? interpolate(msg.title, phase.values) : null;
    const body = interpolate(msg.body, phase.values);
    return (
      <div className={`${rootClass} rfb-renderer--success`} role="status">
        <div className="rfb-renderer__feedback rfb-renderer__feedback--success">
          <div className="rfb-renderer__feedback-icon" aria-hidden="true">
            ✓
          </div>
          {title && <h3 className="rfb-renderer__feedback-title">{title}</h3>}
          <p className="rfb-renderer__feedback-body">{body}</p>
          {phase.redirect && (
            <p className="rfb-renderer__feedback-hint">
              Redirecting{phase.redirect.delay ? ` in ${Math.round((phase.redirect.delay ?? 0) / 1000)}s` : ""}…
            </p>
          )}
          {msg.showSubmitAgain && !phase.redirect && (
            <button
              type="button"
              className="rfb-renderer__button rfb-renderer__button--primary"
              onClick={handleSubmitAgain}
            >
              {msg.submitAgainLabel ?? "Submit another response"}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Error view ---------- */
  if (phase.kind === "error") {
    const msg = phase.message;
    return (
      <div className={`${rootClass} rfb-renderer--error`} role="alert">
        <div className="rfb-renderer__feedback rfb-renderer__feedback--error">
          <div className="rfb-renderer__feedback-icon" aria-hidden="true">
            !
          </div>
          {msg.title && (
            <h3 className="rfb-renderer__feedback-title">{msg.title}</h3>
          )}
          <p className="rfb-renderer__feedback-body">{msg.body}</p>
          {msg.showRetry !== false && (
            <button
              type="button"
              className="rfb-renderer__button rfb-renderer__button--primary"
              onClick={() => {
                setPhase({ kind: "form" });
                setStatusMessage(null);
              }}
            >
              {msg.retryLabel ?? "Try again"}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Form view ---------- */
  return (
    <form className={rootClass} onSubmit={handleSubmit} noValidate>
      {showHeader && schema.title && (
        <h2 className="rfb-renderer__title">{schema.title}</h2>
      )}
      {showHeader && schema.description && (
        <p className="rfb-renderer__description">{schema.description}</p>
      )}

      {isMultiPage && layoutType === "steps" && (
        <ol className="rfb-renderer__stepper" aria-label="Form steps">
          {(schema.layout?.pages ?? []).map((page, index) => {
            const status =
              index < currentPageIndex
                ? "done"
                : index === currentPageIndex
                  ? "current"
                  : "upcoming";
            return (
              <li
                key={page.id}
                className={[
                  "rfb-renderer__stepper-item",
                  `rfb-renderer__stepper-item--${status}`,
                ].join(" ")}
                aria-current={status === "current" ? "step" : undefined}
              >
                <span className="rfb-renderer__stepper-bullet">{index + 1}</span>
                <span className="rfb-renderer__stepper-label">
                  {page.title || `Step ${index + 1}`}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {isMultiPage && layoutType === "tabs" && (
        <div
          className="rfb-renderer__tabbar"
          role="tablist"
          aria-label="Form sections"
        >
          {(schema.layout?.pages ?? []).map((page, index) => (
            <button
              key={page.id}
              type="button"
              role="tab"
              aria-selected={index === currentPageIndex}
              className={[
                "rfb-renderer__tab",
                index === currentPageIndex && "rfb-renderer__tab--active",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => goToPage(index)}
            >
              {page.title || `Tab ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      {isMultiPage && currentPage?.title && layoutType !== "tabs" && (
        <div className="rfb-renderer__step-header">
          <p className="rfb-renderer__step-indicator">
            Step {currentPageIndex + 1} of {pageCount}
          </p>
          <h3 className="rfb-renderer__step-title">{currentPage.title}</h3>
          {currentPage.description && (
            <p className="rfb-renderer__step-description">
              {currentPage.description}
            </p>
          )}
        </div>
      )}

      <div className="rfb-renderer__grid">
        {fields.map((field) => {
          const span = Math.max(
            1,
            Math.min(12, Number(field.props?.gridSpan ?? 12)),
          );
          const style: CSSProperties = {
            gridColumn: `span ${span} / span ${span}`,
          };
          const dynamicOptions = form.engine.getDynamicOptions(field.id);
          return (
            <div key={field.id} className="rfb-renderer__grid-item" style={style}>
              <BasicField
                field={field}
                registry={form.fieldRegistry}
                value={values[field.name]}
                error={errors[field.name]}
                disabled={form.engine.isFieldEffectivelyDisabled(field)}
                readOnly={readOnly || field.readonly}
                dynamicOptions={dynamicOptions}
                onChange={(value) => setValue(field.name, value)}
                onBlur={() => {
                  validateField(field.name);
                  void form.triggerEvent(field.id, "blur");
                }}
                onFocus={() => {
                  void form.triggerEvent(field.id, "focus");
                }}
                onClick={() => {
                  void form.triggerEvent(field.id, "click");
                }}
              />
            </div>
          );
        })}
      </div>

      {showActions && !readOnly && (
        <div className="rfb-renderer__actions">
          {isMultiPage && layoutType === "steps" && !isFirstPage && (
            <button
              type="button"
              className="rfb-renderer__button rfb-renderer__button--secondary"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}

          {schema.settings?.showCancel !== false && schema.settings?.cancelLabel && (
            <button
              type="button"
              className="rfb-renderer__button rfb-renderer__button--secondary"
              onClick={() => onCancel?.()}
            >
              {schema.settings.cancelLabel}
            </button>
          )}

          <button type="submit" className="rfb-renderer__button rfb-renderer__button--primary">
            {isMultiPage && layoutType === "steps" && !isLastPage
              ? "Next"
              : (schema.settings?.submitLabel ?? "Submit")}
          </button>
        </div>
      )}

      {statusMessage && (
        <p className="rfb-renderer__status" role="status">
          {statusMessage}
        </p>
      )}
    </form>
  );
}

/** Used by host apps that want to render the form body without the modal wrapper. */
export { FormBody as InlineFormRenderer };
