import { FormRenderer } from "@rfb-ddt/renderer-react";
import type { FormSchema } from "@rfb-ddt/schema";
import { useState } from "react";
import { IconDesktop, IconMobile, IconTablet } from "../icons.js";

export interface BuilderPreviewProps {
  schema: FormSchema;
}

export type PreviewViewport = "mobile" | "tablet" | "desktop";

const VIEWPORT_WIDTHS: Record<PreviewViewport, number | null> = {
  mobile: 375,
  tablet: 768,
  desktop: null,
};

const VIEWPORT_LABELS: Record<PreviewViewport, string> = {
  mobile: "Mobile view (375px)",
  tablet: "Tablet view (768px)",
  desktop: "Desktop view",
};

const VIEWPORT_ICONS: Record<PreviewViewport, React.ComponentType> = {
  mobile: IconMobile,
  tablet: IconTablet,
  desktop: IconDesktop,
};

export function BuilderPreview({ schema }: BuilderPreviewProps) {
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const width = VIEWPORT_WIDTHS[viewport];

  return (
    <div className="rfb-builder-preview-wrapper">
      <div className="rfb-builder-preview__toolbar" role="toolbar">
        <span className="rfb-builder-preview__viewport-label">Viewport</span>
        <div
          className="rfb-builder-preview__viewport-group"
          role="radiogroup"
          aria-label="Preview viewport"
        >
          {(Object.keys(VIEWPORT_WIDTHS) as PreviewViewport[]).map((v) => {
            const Icon = VIEWPORT_ICONS[v];
            const active = viewport === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={VIEWPORT_LABELS[v]}
                title={VIEWPORT_LABELS[v]}
                className={[
                  "rfb-builder-preview__viewport-btn",
                  active && "rfb-builder-preview__viewport-btn--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setViewport(v)}
              >
                <Icon />
              </button>
            );
          })}
        </div>
        {width && (
          <span className="rfb-builder-preview__viewport-meta">{width}px</span>
        )}
      </div>

      <div
        className={[
          "rfb-builder-preview",
          `rfb-builder-preview--${viewport}`,
        ].join(" ")}
      >
        {schema.fields.length === 0 ? (
          <div className="rfb-builder-preview__frame rfb-builder-preview__frame--empty">
            <p>Add fields to see a live preview</p>
          </div>
        ) : (
          <div
            className="rfb-builder-preview__frame"
            style={width ? { maxWidth: `${width}px` } : undefined}
          >
            <FormRenderer schema={schema} showHeader />
          </div>
        )}
      </div>
    </div>
  );
}
