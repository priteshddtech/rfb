import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { SignatureField as SignatureFieldSchema } from "@rfb-ddt/schema";
import { FieldWrapper, fieldControlId } from "../FieldWrapper.js";
import type { FieldComponentProps } from "../types.js";

interface Point {
  x: number;
  y: number;
}

const DEFAULT_HEIGHT = 160;
const DEFAULT_PEN_COLOR = "#111827";
const DEFAULT_BG = "#ffffff";

export function SignatureFieldComponent({
  field,
  value,
  onChange,
  onBlur,
  onFocus,
  onClick,
  error,
  disabled,
  readOnly,
  preview,
}: FieldComponentProps<SignatureFieldSchema>) {
  const id = fieldControlId(field.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const dprRef = useRef(1);

  const [hasInk, setHasInk] = useState<boolean>(!!value);
  const stringValue = typeof value === "string" ? value : "";

  const penColor = field.penColor ?? DEFAULT_PEN_COLOR;
  const penWidth = field.penWidth ?? 2;
  const backgroundColor = field.backgroundColor ?? DEFAULT_BG;
  const fixedWidth = field.width;
  const height = field.height ?? DEFAULT_HEIGHT;
  const clearable = field.clearable ?? true;
  const interactive = !disabled && !readOnly && !preview;

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const paintBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [backgroundColor, getContext]);

  const loadFromDataUrl = useCallback(
    (dataUrl: string) => {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (!canvas || !ctx || !dataUrl) return;
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      };
      img.src = dataUrl;
    },
    [backgroundColor, getContext],
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const cssWidth = fixedWidth ?? canvas.parentElement?.clientWidth ?? 400;
    const cssHeight = height;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    const ctx = getContext();
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    paintBackground();
    if (stringValue) {
      loadFromDataUrl(stringValue);
    }
  }, [fixedWidth, getContext, height, loadFromDataUrl, paintBackground, stringValue]);

  useEffect(() => {
    resizeCanvas();
    if (fixedWidth) return;
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resizeCanvas, fixedWidth]);

  useEffect(() => {
    setHasInk(!!stringValue);
  }, [stringValue]);

  const getRelativePoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    event.preventDefault();
    canvasRef.current?.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getRelativePoint(event);
    onClick?.();
    onFocus?.();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !drawingRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const point = getRelativePoint(event);
    const last = lastPointRef.current ?? point;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    if (!hasInk) setHasInk(true);
  };

  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onChange(dataUrl);
    onBlur?.();
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    canvasRef.current?.releasePointerCapture(event.pointerId);
    finishStroke();
  };

  const handlePointerLeave = () => {
    if (drawingRef.current) finishStroke();
  };

  const handleClear = () => {
    if (!interactive) return;
    paintBackground();
    setHasInk(false);
    onChange("");
  };

  return (
    <FieldWrapper field={field} error={error} controlId={id}>
      <div className={`rfb-signature${disabled || readOnly ? " rfb-signature--disabled" : ""}`}>
        <canvas
          id={id}
          ref={canvasRef}
          className="rfb-signature__canvas"
          aria-label={field.label ?? "Signature pad"}
          aria-invalid={error ? true : undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          style={{ touchAction: "none" }}
        />
        {!hasInk && (
          <div className="rfb-signature__placeholder" aria-hidden="true">
            {field.placeholder ?? "Sign here"}
          </div>
        )}
        {clearable && interactive && (
          <div className="rfb-signature__actions">
            <button
              type="button"
              className="rfb-signature__clear"
              onClick={handleClear}
              disabled={!hasInk}
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
