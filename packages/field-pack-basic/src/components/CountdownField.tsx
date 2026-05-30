import type { CountdownField as CountdownFieldSchema } from "@rfb-ddt/schema";
import { useEffect, useState } from "react";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function compute(target: string): Remaining {
  const t = new Date(target).getTime();
  const diff = isNaN(t) ? 0 : t - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  };
}

export function CountdownFieldComponent({
  field,
  error,
}: FieldComponentProps<CountdownFieldSchema>) {
  const id = fieldControlId(field.id);
  const target = field.target;
  const showLabels = field.showLabels !== false;
  const [remaining, setRemaining] = useState<Remaining>(() => compute(target));

  useEffect(() => {
    if (!target) return;
    const interval = window.setInterval(() => {
      const next = compute(target);
      setRemaining(next);
      if (next.done && field.onComplete === "stop") {
        window.clearInterval(interval);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [target, field.onComplete]);

  if (!target) {
    return (
      <FieldWrapper field={field} error={error} controlId={id}>
        <div className="rfb-countdown rfb-countdown--placeholder">
          Set a target date/time in the field config.
        </div>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div
        className={[
          "rfb-countdown",
          remaining.done && "rfb-countdown--done",
        ]
          .filter(Boolean)
          .join(" ")}
        id={id}
        aria-live="polite"
      >
        <Unit value={remaining.days} label="days" showLabel={showLabels} />
        <Unit value={remaining.hours} label="hours" showLabel={showLabels} />
        <Unit
          value={remaining.minutes}
          label="minutes"
          showLabel={showLabels}
        />
        <Unit
          value={remaining.seconds}
          label="seconds"
          showLabel={showLabels}
        />
      </div>
    </FieldWrapper>
  );
}

function Unit({
  value,
  label,
  showLabel,
}: {
  value: number;
  label: string;
  showLabel: boolean;
}) {
  return (
    <div className="rfb-countdown__unit">
      <strong>{value.toString().padStart(2, "0")}</strong>
      {showLabel && <span>{label}</span>}
    </div>
  );
}
