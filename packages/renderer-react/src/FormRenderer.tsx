import { isFieldDisabled } from "@rfb-ddt/core";
import { BasicField } from "@rfb-ddt/field-pack-basic";
import "@rfb-ddt/field-pack-basic/styles.css";
import type { CSSProperties } from "react";
import { useState, type FormEvent } from "react";
import "./styles/renderer.css";
import type { FormRendererProps } from "./types.js";
import { useFormRenderer } from "./useFormRenderer.js";

export function FormRenderer({
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
          return (
            <div key={field.id} className="rfb-renderer__grid-item" style={style}>
              <BasicField
                field={field}
                registry={form.fieldRegistry}
                value={values[field.name]}
                error={errors[field.name]}
                disabled={isFieldDisabled(field, schema.fields, values)}
                readOnly={readOnly || field.readonly}
                onChange={(value) => setValue(field.name, value)}
                onBlur={() => validateField(field.name)}
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
