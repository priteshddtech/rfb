import type {
  AfterSubmitHook,
  BeforeSubmitHook,
  SubmitResult,
} from "@rfb-ddt/core";
import type { ReactFieldRegistry } from "@rfb-ddt/field-pack-basic";
import type { FormResponse, FormSchema, LayoutType } from "@rfb-ddt/schema";

export interface FormRendererProps {
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  className?: string;
  /** React field components registry. Defaults to basic field pack. */
  fieldRegistry?: ReactFieldRegistry;
  /** Show form title and description. Default: true. */
  showHeader?: boolean;
  /** Show submit / cancel / step controls. Default: true. */
  showActions?: boolean;
  registerBuiltins?: boolean;
  onChange?: (values: Record<string, unknown>) => void;
  onSubmit?: (result: SubmitResult) => void | Promise<void>;
  onSubmitSuccess?: (response: FormResponse) => void;
  onSubmitError?: (errors: Record<string, string>) => void;
  onCancel?: () => void;
}

export interface UseFormRendererOptions {
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  fieldRegistry?: ReactFieldRegistry;
  registerBuiltins?: boolean;
  onChange?: (values: Record<string, unknown>) => void;
  onBeforeSubmit?: BeforeSubmitHook;
  onAfterSubmit?: AfterSubmitHook;
}

export interface UseFormRendererReturn {
  schema: FormSchema;
  fieldRegistry: ReactFieldRegistry;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  fields: ReturnType<
    import("@rfb-ddt/core").FormEngine["getVisibleFields"]
  >;
  readOnly: boolean;
  currentPageIndex: number;
  pageCount: number;
  layoutType: LayoutType;
  setValue: (fieldName: string, value: unknown) => void;
  validateField: (fieldName: string) => boolean;
  validate: () => boolean;
  nextPage: () => boolean;
  previousPage: () => boolean;
  goToPage: (index: number) => boolean;
  submit: () => Promise<SubmitResult>;
  engine: import("@rfb-ddt/core").FormEngine;
}
