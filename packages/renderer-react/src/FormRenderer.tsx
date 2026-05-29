import { BasicField } from "@rfb-ddt/field-pack-basic";
import "@rfb-ddt/field-pack-basic/styles.css";
import type { FormResponse } from "@rfb-ddt/schema";
import {
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { FormModal } from "./FormModal.js";
import "./styles/renderer.css";
import type { FormRendererProps } from "./types.js";
import { useFormRenderer } from "./useFormRenderer.js";

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
      // Slight defer so the user briefly sees the success message
      // before the modal closes.
      setTimeout(() => setOpen(false), 250);
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
  } = form;

  const isMultiPage = layoutType !== "single" && pageCount > 1;
  const isLastPage = currentPageIndex >= pageCount - 1;
  const isFirstPage = currentPageIndex === 0;
  const currentPage = schema.layout?.pages?.[currentPageIndex];

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
      } else {
        setStatusMessage("Please fix the errors below.");
        onSubmitError?.(form.errors);
      }
      return;
    }

    if (result.response) {
      onSubmitSuccess?.(result.response);
      setStatusMessage(
        schema.settings?.successMessage ?? "Submitted successfully.",
      );
    }
  }

  function handlePrevious() {
    setStatusMessage(null);
    previousPage();
  }

  const rootClass = ["rfb-renderer", className].filter(Boolean).join(" ");

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
