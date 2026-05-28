import { createFormEngine } from "@rfb-ddt/core";
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
  };
}
