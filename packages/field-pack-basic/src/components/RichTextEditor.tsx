import { useCallback, useEffect, useRef, useState } from "react";
import type { RichTextToolbarButton } from "@rfb-ddt/schema";

export interface RichTextEditorProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  toolbar?: RichTextToolbarButton[];
  minHeight?: number;
}

const DEFAULT_TOOLBAR: RichTextToolbarButton[] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "h1",
  "h2",
  "h3",
  "paragraph",
  "ul",
  "ol",
  "link",
  "clear",
];

interface ToolbarConfig {
  id: RichTextToolbarButton;
  label: string;
  /** ARIA / hover title */
  title: string;
  run: (editor: HTMLDivElement) => void;
}

/**
 * Wrapper around `document.execCommand` — yes, it's officially deprecated but
 * remains supported in every evergreen browser and is by far the smallest path
 * to a working WYSIWYG editor without adding a dependency.
 */
function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function focusEditor(editor: HTMLDivElement) {
  editor.focus();
}

function isHtmlEffectivelyEmpty(html: string): boolean {
  const stripped = html
    .replace(/<br\s*\/?>(?:\s|&nbsp;)*/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<div>\s*<\/div>/gi, "")
    .replace(/&nbsp;/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  return stripped.length === 0;
}

const TOOLBAR_DEFS: Record<RichTextToolbarButton, Omit<ToolbarConfig, "id">> = {
  bold: {
    label: "B",
    title: "Bold (Ctrl+B)",
    run: (editor) => {
      focusEditor(editor);
      exec("bold");
    },
  },
  italic: {
    label: "I",
    title: "Italic (Ctrl+I)",
    run: (editor) => {
      focusEditor(editor);
      exec("italic");
    },
  },
  underline: {
    label: "U",
    title: "Underline (Ctrl+U)",
    run: (editor) => {
      focusEditor(editor);
      exec("underline");
    },
  },
  strikethrough: {
    label: "S",
    title: "Strikethrough",
    run: (editor) => {
      focusEditor(editor);
      exec("strikeThrough");
    },
  },
  h1: {
    label: "H1",
    title: "Heading 1",
    run: (editor) => {
      focusEditor(editor);
      exec("formatBlock", "H1");
    },
  },
  h2: {
    label: "H2",
    title: "Heading 2",
    run: (editor) => {
      focusEditor(editor);
      exec("formatBlock", "H2");
    },
  },
  h3: {
    label: "H3",
    title: "Heading 3",
    run: (editor) => {
      focusEditor(editor);
      exec("formatBlock", "H3");
    },
  },
  paragraph: {
    label: "P",
    title: "Paragraph",
    run: (editor) => {
      focusEditor(editor);
      exec("formatBlock", "P");
    },
  },
  ul: {
    label: "•",
    title: "Bullet list",
    run: (editor) => {
      focusEditor(editor);
      exec("insertUnorderedList");
    },
  },
  ol: {
    label: "1.",
    title: "Numbered list",
    run: (editor) => {
      focusEditor(editor);
      exec("insertOrderedList");
    },
  },
  link: {
    label: "🔗",
    title: "Insert link",
    run: (editor) => {
      focusEditor(editor);
      const url = window.prompt("Enter URL");
      if (!url) return;
      exec("createLink", url);
    },
  },
  clear: {
    label: "⌫",
    title: "Clear formatting",
    run: (editor) => {
      focusEditor(editor);
      exec("removeFormat");
      exec("formatBlock", "P");
    },
  },
};

export function RichTextEditor({
  id,
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  onClick,
  placeholder,
  disabled,
  readOnly,
  invalid,
  toolbar,
  minHeight,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState<boolean>(() => isHtmlEffectivelyEmpty(value ?? ""));
  const isInternalUpdate = useRef(false);

  // Sync external value into the contenteditable element when it changes
  // from outside (e.g. defaultValue, controlled reset).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if ((value ?? "") !== el.innerHTML) {
      el.innerHTML = value ?? "";
      setIsEmpty(isHtmlEffectivelyEmpty(el.innerHTML));
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalUpdate.current = true;
    const html = el.innerHTML;
    setIsEmpty(isHtmlEffectivelyEmpty(html));
    onChange(html);
  }, [onChange]);

  const editable = !disabled && !readOnly;
  const items = (toolbar ?? DEFAULT_TOOLBAR)
    .filter((id) => id in TOOLBAR_DEFS)
    .map((id) => ({ id, ...TOOLBAR_DEFS[id] }));

  return (
    <div
      className={`rfb-richtext${disabled ? " rfb-richtext--disabled" : ""}${invalid ? " rfb-richtext--invalid" : ""}`}
    >
      {editable && items.length > 0 && (
        <div className="rfb-richtext__toolbar" role="toolbar" aria-label="Formatting">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="rfb-richtext__btn"
              title={item.title}
              aria-label={item.title}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (editorRef.current) item.run(editorRef.current);
                handleInput();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div
        id={id}
        ref={editorRef}
        className="rfb-richtext__editor"
        contentEditable={editable}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        data-placeholder={placeholder}
        data-name={name}
        data-empty={isEmpty || undefined}
        style={minHeight ? { minHeight } : undefined}
        onInput={handleInput}
        onBlur={onBlur}
        onFocus={onFocus}
        onClick={onClick}
      />
    </div>
  );
}
