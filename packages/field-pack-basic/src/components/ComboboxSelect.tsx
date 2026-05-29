import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import type { SelectField as SelectFieldSchema, SelectOption } from "@rfb-ddt/schema";

export interface ComboboxSelectProps {
  field: SelectFieldSchema;
  controlId: string;
  options: SelectOption[];
  value: unknown;
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onClick?: () => void;
}

function valuesEqual(a: SelectOption["value"], b: unknown): boolean {
  return String(a) === String(b);
}

function toSelectedValues(
  raw: unknown,
  multiple: boolean,
): string[] {
  if (multiple) {
    if (Array.isArray(raw)) return raw.map((v) => String(v));
    if (raw == null || raw === "") return [];
    return [String(raw)];
  }
  if (raw == null || raw === "") return [];
  return [String(raw)];
}

/**
 * Combobox-style replacement for the native `<select>` element. Supports:
 *   - Search/typeahead filtering of options
 *   - Multi-select with removable chips
 *   - Optional `creatable` mode to add free-text values
 *   - Keyboard navigation (ArrowUp/Down, Enter, Escape, Backspace)
 */
export function ComboboxSelect({
  field,
  controlId,
  options,
  value,
  loading,
  disabled,
  readOnly,
  error,
  onChange,
  onBlur,
  onFocus,
  onClick,
}: ComboboxSelectProps) {
  const multiple = !!field.multiple;
  const searchable = field.searchable ?? true;
  const creatable = !!field.creatable;
  const listboxId = useId();

  const selectedValues = useMemo(
    () => toSelectedValues(value, multiple),
    [value, multiple],
  );

  const selectedOptions = useMemo(() => {
    return selectedValues.map((sv) => {
      const found = options.find((opt) => valuesEqual(opt.value, sv));
      return (
        found ?? {
          value: sv,
          label: sv,
        } satisfies SelectOption
      );
    });
  }, [options, selectedValues]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const visibleOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      return (
        opt.label.toLowerCase().includes(q) ||
        String(opt.value).toLowerCase().includes(q) ||
        (opt.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    if (visibleOptions.length === 0) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((prev) => {
      if (prev < 0 || prev >= visibleOptions.length) return 0;
      return prev;
    });
  }, [open, visibleOptions.length]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  const openMenu = useCallback(() => {
    if (disabled || readOnly) return;
    setOpen(true);
    onClick?.();
  }, [disabled, readOnly, onClick]);

  const commitOption = useCallback(
    (opt: SelectOption) => {
      if (opt.disabled) return;
      if (multiple) {
        const exists = selectedValues.includes(String(opt.value));
        const next = exists
          ? selectedValues.filter((v) => v !== String(opt.value))
          : [...selectedValues, String(opt.value)];
        onChange(next);
        setQuery("");
        inputRef.current?.focus();
      } else {
        onChange(opt.value);
        closeMenu();
      }
    },
    [closeMenu, multiple, onChange, selectedValues],
  );

  const commitCreate = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const alreadyExists = options.some(
      (opt) => String(opt.value).toLowerCase() === trimmed.toLowerCase() ||
        opt.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (alreadyExists) return;
    commitOption({ label: trimmed, value: trimmed });
  }, [commitOption, options, query]);

  const removeValue = useCallback(
    (rawValue: string) => {
      if (multiple) {
        onChange(selectedValues.filter((v) => v !== rawValue));
      } else {
        onChange("");
      }
    },
    [multiple, onChange, selectedValues],
  );

  const clearAll = useCallback(() => {
    if (multiple) onChange([]);
    else onChange("");
    setQuery("");
    inputRef.current?.focus();
  }, [multiple, onChange]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          if (!open) {
            openMenu();
            return;
          }
          setActiveIndex((prev) => {
            const next = prev + 1;
            return next >= visibleOptions.length ? 0 : next;
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          if (!open) {
            openMenu();
            return;
          }
          setActiveIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? visibleOptions.length - 1 : next;
          });
          break;
        case "Enter": {
          if (!open) return;
          event.preventDefault();
          if (activeIndex >= 0 && activeIndex < visibleOptions.length) {
            commitOption(visibleOptions[activeIndex]);
          } else if (creatable) {
            commitCreate();
          }
          break;
        }
        case "Escape":
          if (open) {
            event.preventDefault();
            closeMenu();
          }
          break;
        case "Backspace":
          if (!query && multiple && selectedValues.length > 0) {
            event.preventDefault();
            removeValue(selectedValues[selectedValues.length - 1]);
          }
          break;
        case "Tab":
          if (open) closeMenu();
          break;
        default:
          break;
      }
    },
    [
      activeIndex,
      closeMenu,
      commitCreate,
      commitOption,
      creatable,
      disabled,
      multiple,
      open,
      openMenu,
      query,
      readOnly,
      removeValue,
      selectedValues,
      visibleOptions,
    ],
  );

  const handleContainerFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    onFocus?.();
  };

  const handleContainerBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(document.activeElement)) {
        setOpen(false);
        onBlur?.();
      }
    }, 80);
  };

  const placeholder = field.placeholder ?? (multiple ? "Select…" : "Select…");
  const showClear = !disabled && !readOnly && selectedValues.length > 0;

  return (
    <div
      ref={containerRef}
      className={`rfb-combobox${open ? " rfb-combobox--open" : ""}${disabled ? " rfb-combobox--disabled" : ""}${error ? " rfb-combobox--error" : ""}${multiple ? " rfb-combobox--multi" : ""}`}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
    >
      <div
        className="rfb-combobox__control"
        onMouseDown={(e) => {
          if (e.target instanceof HTMLElement && e.target.closest(".rfb-combobox__chip-remove")) return;
          if (e.target instanceof HTMLElement && e.target.closest(".rfb-combobox__clear")) return;
          if (document.activeElement !== inputRef.current) {
            e.preventDefault();
            inputRef.current?.focus();
            openMenu();
          }
        }}
        aria-disabled={disabled || readOnly || undefined}
      >
        <div className="rfb-combobox__values">
          {multiple && selectedOptions.map((opt) => (
            <span key={String(opt.value)} className="rfb-combobox__chip">
              {opt.image && (
                <img className="rfb-combobox__chip-image" src={opt.image} alt="" />
              )}
              <span className="rfb-combobox__chip-label">{opt.label}</span>
              {!disabled && !readOnly && (
                <button
                  type="button"
                  className="rfb-combobox__chip-remove"
                  aria-label={`Remove ${opt.label}`}
                  onClick={() => removeValue(String(opt.value))}
                  tabIndex={-1}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {!multiple && selectedOptions[0] && !query && (
            <span className="rfb-combobox__single">
              {selectedOptions[0].image && (
                <img
                  className="rfb-combobox__single-image"
                  src={selectedOptions[0].image}
                  alt=""
                />
              )}
              <span>{selectedOptions[0].label}</span>
            </span>
          )}
          <input
            ref={inputRef}
            id={controlId}
            type="text"
            className="rfb-combobox__input"
            value={query}
            placeholder={
              multiple
                ? selectedOptions.length > 0
                  ? ""
                  : placeholder
                : selectedOptions[0]
                  ? ""
                  : placeholder
            }
            disabled={disabled || readOnly}
            readOnly={!searchable && !creatable}
            aria-autocomplete={searchable ? "list" : undefined}
            aria-controls={listboxId}
            aria-expanded={open}
            aria-haspopup="listbox"
            role="combobox"
            onChange={(e) => {
              if (!searchable && !creatable) return;
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={openMenu}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
        <div className="rfb-combobox__indicators">
          {showClear && (
            <button
              type="button"
              className="rfb-combobox__clear"
              aria-label="Clear selection"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearAll}
              tabIndex={-1}
            >
              ×
            </button>
          )}
          <span className="rfb-combobox__caret" aria-hidden="true">
            ▾
          </span>
        </div>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          className="rfb-combobox__menu"
          role="listbox"
          aria-multiselectable={multiple || undefined}
        >
          {loading && (
            <li className="rfb-combobox__empty">Loading…</li>
          )}
          {!loading && visibleOptions.length === 0 && !creatable && (
            <li className="rfb-combobox__empty">No matches</li>
          )}
          {!loading && visibleOptions.length === 0 && creatable && query.trim() && (
            <li
              className="rfb-combobox__create"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={commitCreate}
            >
              Create <strong>{query.trim()}</strong>
            </li>
          )}
          {visibleOptions.map((opt, i) => {
            const isSelected = selectedValues.includes(String(opt.value));
            const isActive = i === activeIndex;
            return (
              <li
                key={String(opt.value)}
                className={`rfb-combobox__option${isActive ? " rfb-combobox__option--active" : ""}${isSelected ? " rfb-combobox__option--selected" : ""}${opt.disabled ? " rfb-combobox__option--disabled" : ""}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commitOption(opt)}
              >
                {multiple && (
                  <span className="rfb-combobox__check" aria-hidden="true">
                    {isSelected ? "✓" : ""}
                  </span>
                )}
                {opt.image && (
                  <img className="rfb-combobox__option-image" src={opt.image} alt="" />
                )}
                <span className="rfb-combobox__option-body">
                  <span className="rfb-combobox__option-label">{opt.label}</span>
                  {opt.description && (
                    <span className="rfb-combobox__option-description">
                      {opt.description}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
