import type { YoutubeField as YoutubeFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

/**
 * Embed a YouTube video. Accepts either a full YouTube URL or just the
 * 11-character video id. Presentational only — not a submittable input.
 */
export function YoutubeFieldComponent({
  field,
  error,
}: FieldComponentProps<YoutubeFieldSchema>) {
  const id = fieldControlId(field.id);
  const videoId = extractYoutubeId(field.url);

  return (
    <FieldWrapper
      field={field}
      error={error}
      controlId={id}
      showLabel={!!field.label}
    >
      <div
        className="rfb-youtube"
        style={{
          width: typeof field.width === "number" ? `${field.width}px` : field.width,
        }}
      >
        {videoId ? (
          <iframe
            className="rfb-youtube__frame"
            src={`https://www.youtube.com/embed/${videoId}${
              field.controls === false ? "?controls=0" : ""
            }`}
            title={field.label || "YouTube video"}
            style={{
              height:
                typeof field.height === "number"
                  ? `${field.height}px`
                  : field.height || "315px",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="rfb-youtube__placeholder">
            Set a YouTube URL or video id to embed.
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

function extractYoutubeId(input: string | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace(/^\//, "").slice(0, 11) || null;
    }
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.slice(7, 18) || null;
      }
      const v = url.searchParams.get("v");
      return v && v.length === 11 ? v : null;
    }
  } catch {
    /* not a URL */
  }
  return null;
}
