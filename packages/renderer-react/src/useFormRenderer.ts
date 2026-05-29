import { createFormEngine } from "@rfb-ddt/core";
import type { FieldEvent } from "@rfb-ddt/schema";
import { createBasicReactFieldRegistry } from "@rfb-ddt/field-pack-basic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseFormRendererOptions, UseFormRendererReturn } from "./types.js";

export function useFormRenderer(
  options: UseFormRendererOptions,
): UseFormRendererReturn {
  const {
    schema,
    initialValues,
    registerBuiltins,
    onChange,
    onBeforeSubmit,
    onAfterSubmit,
  } = options;

  const fieldRegistry = useMemo(
    () => options.fieldRegistry ?? createBasicReactFieldRegistry(),
    [options.fieldRegistry],
  );

  const engine = useMemo(
    () =>
      createFormEngine({
        schema,
        initialValues,
        registerBuiltins,
      }),
    [schema, initialValues, registerBuiltins],
  );

  const [, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((n) => n + 1), []);

  // Re-render when action-driven overrides change so the UI reflects them.
  useEffect(() => engine.onStateChange(bump), [engine, bump]);

  useEffect(() => {
    const unsubBefore = onBeforeSubmit
      ? engine.onBeforeSubmit(onBeforeSubmit)
      : undefined;
    const unsubAfter = onAfterSubmit
      ? engine.onAfterSubmit(onAfterSubmit)
      : undefined;
    return () => {
      unsubBefore?.();
      unsubAfter?.();
    };
  }, [engine, onBeforeSubmit, onAfterSubmit]);

  // Fire `load` events for every field that has one, once per engine.
  useEffect(() => {
    const loadFields = engine
      .getSchema()
      .fields.filter((f) => (f.events ?? []).some((b) => b.event === "load"));
    if (loadFields.length === 0) return;
    void (async () => {
      for (const field of loadFields) {
        await engine.triggerEvent(field.id, "load");
      }
    })();
  }, [engine]);

  const triggerEvent = useCallback(
    (fieldId: string, event: FieldEvent) => engine.triggerEvent(fieldId, event),
    [engine],
  );

  const setValue = useCallback(
    (fieldName: string, value: unknown) => {
      engine.setValue(fieldName, value);
      bump();
      onChange?.(engine.getValues());
    },
    [engine, bump, onChange],
  );

  const validateField = useCallback(
    (fieldName: string) => {
      const ok = engine.validate([fieldName]);
      bump();
      return ok;
    },
    [engine, bump],
  );

  const validate = useCallback(() => {
    const ok = engine.validate();
    bump();
    return ok;
  }, [engine, bump]);

  const nextPage = useCallback(() => {
    const ok = engine.nextPage();
    bump();
    return ok;
  }, [engine, bump]);

  const previousPage = useCallback(() => {
    const ok = engine.previousPage();
    bump();
    return ok;
  }, [engine, bump]);

  const goToPage = useCallback(
    (index: number) => {
      const ok = engine.goToPage(index);
      bump();
      return ok;
    },
    [engine, bump],
  );

  const submit = useCallback(async () => {
    const result = await engine.submit();
    bump();
    return result;
  }, [engine, bump]);

  const layoutType = schema.layout?.type ?? "single";

  return {
    schema,
    fieldRegistry,
    engine,
    values: engine.getValues(),
    errors: engine.getErrors(),
    fields: engine.getVisibleFields(),
    readOnly: engine.isReadOnly(),
    currentPageIndex: engine.getCurrentPageIndex(),
    pageCount: engine.getPageCount(),
    layoutType,
    setValue,
    validateField,
    validate,
    nextPage,
    previousPage,
    goToPage,
    submit,
    triggerEvent,
  };
}
