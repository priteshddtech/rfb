import type { VoiceField as VoiceFieldSchema } from "@rfb-ddt/schema";
import { useEffect, useRef, useState } from "react";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

/**
 * Voice recorder — uses MediaRecorder to capture audio and stores it as a
 * base64 data URL. Falls back to an inline note on browsers without
 * `MediaRecorder`.
 */
export function VoiceFieldComponent({
  field,
  value,
  onChange,
  error,
  disabled,
  readOnly,
  preview,
}: FieldComponentProps<VoiceFieldSchema>) {
  const id = fieldControlId(field.id);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(
    typeof value === "string" && value ? value : null,
  );
  const [error_, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  const maxDuration = field.maxDuration ?? 120;
  const supported =
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined";

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaRef.current && mediaRef.current.state !== "inactive") {
        mediaRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    if (preview || !supported) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(
        stream,
        field.mimeType ? { mimeType: field.mimeType } : undefined,
      );
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setAudioUrl(dataUrl);
          onChange(dataUrl);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          if (next >= maxDuration) stopRecording();
          return next;
        });
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not access microphone",
      );
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    setRecording(false);
  }

  function clearRecording() {
    setAudioUrl(null);
    onChange("");
  }

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div className="rfb-voice" id={id} aria-disabled={disabled || readOnly}>
        {!supported && (
          <p className="rfb-voice__unsupported">
            Voice recording isn't supported in this browser.
          </p>
        )}
        <div className="rfb-voice__controls">
          {!recording ? (
            <button
              type="button"
              className="rfb-voice__btn rfb-voice__btn--record"
              onClick={startRecording}
              disabled={disabled || readOnly || !supported || preview}
            >
              <span className="rfb-voice__dot" aria-hidden="true" />
              {audioUrl ? "Re-record" : "Record"}
            </button>
          ) : (
            <button
              type="button"
              className="rfb-voice__btn rfb-voice__btn--stop"
              onClick={stopRecording}
            >
              Stop · {formatTime(elapsed)} / {formatTime(maxDuration)}
            </button>
          )}
          {audioUrl && !recording && (
            <button
              type="button"
              className="rfb-voice__btn rfb-voice__btn--clear"
              onClick={clearRecording}
              disabled={disabled || readOnly}
            >
              Clear
            </button>
          )}
        </div>
        {audioUrl && !recording && (
          <audio
            className="rfb-voice__player"
            controls
            src={audioUrl}
            preload="metadata"
          />
        )}
        {error_ && <p className="rfb-field__error">{error_}</p>}
      </div>
    </FieldWrapper>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
