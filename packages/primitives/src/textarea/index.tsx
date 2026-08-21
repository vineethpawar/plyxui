/**
 * Textarea (web). Multi-line sibling of Input -- same theme styling and
 * size scale, plus optional auto-grow so the box tracks its content
 * instead of scrolling. The one field a resume, a bio, or a message box
 * always needs and Input can't cover.
 *
 * Controlled and uncontrolled both work. autoGrow measures scrollHeight
 * on each change and pins the element height between minRows and maxRows.
 *
 * Focus draws the same two-part ring as Input (page-fill gap +
 * primaryOrange). Inline styles can't express :focus-visible, so the
 * ring shows on every focus, not just keyboard focus.
 */
import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { useTheme } from "@plyxui/styles";
import { motion, radius, spacing, transition } from "@plyxui/core";

export type TextareaSize = "sm" | "md" | "lg";

const sizeMap: Record<TextareaSize, { fontSize: number; padX: number; padY: number; lineHeight: number }> = {
  sm: { fontSize: 13, padX: spacing[2], padY: spacing[2], lineHeight: 18 },
  md: { fontSize: 14, padX: spacing[3], padY: spacing[2], lineHeight: 21 },
  lg: { fontSize: 16, padX: spacing[4], padY: spacing[3], lineHeight: 24 },
};

export interface TextareaProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  size?: TextareaSize;
  invalid?: boolean;
  disabled?: boolean;
  /** Visible rows at rest (also the auto-grow floor). Default 3. */
  rows?: number;
  /** Grow with content up to maxRows instead of scrolling. Default true. */
  autoGrow?: boolean;
  /** Auto-grow ceiling; beyond it the textarea scrolls. Default 12. */
  maxRows?: number;
  className?: string;
  style?: CSSProperties;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  maxLength?: number;
  "aria-label"?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    value,
    defaultValue,
    onChange,
    placeholder,
    size = "md",
    invalid,
    disabled,
    rows = 3,
    autoGrow = true,
    maxRows = 12,
    className,
    style,
    autoFocus,
    id,
    name,
    maxLength,
    ...aria
  },
  ref,
) {
  const { colors } = useTheme();
  const [internal, setInternal] = useState<string>(defaultValue ?? "");
  const [focused, setFocused] = useState(false);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const dims = sizeMap[size];

  // Merge the forwarded ref with our own so auto-grow can measure.
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = (el: HTMLTextAreaElement | null) => {
    innerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
  };

  const frame = dims.padY * 2 + 2; // vertical padding + 1px border top/bottom
  const minH = rows * dims.lineHeight + frame;
  const maxH = maxRows * dims.lineHeight + frame;

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el || !autoGrow) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minH), maxH)}px`;
    el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden";
  }, [current, autoGrow, minH, maxH]);

  const textareaStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    minHeight: minH,
    padding: `${dims.padY}px ${dims.padX}px`,
    background: colors.surfaceFill,
    border: `1px solid ${invalid ? colors.statusError : focused ? colors.primaryOrange : colors.stroke}`,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: dims.fontSize,
    lineHeight: `${dims.lineHeight}px`,
    fontFamily: "inherit",
    outline: "none",
    resize: autoGrow ? "none" : "vertical",
    opacity: disabled ? 0.55 : 1,
    boxShadow: focused
      ? `0 0 0 2px ${colors.primaryFill}, 0 0 0 4px ${invalid ? colors.statusError : colors.primaryOrange}`
      : "none",
    transition: [
      transition("border-color", motion.controlHover),
      transition("box-shadow", motion.controlHover),
    ].join(", "),
    ...style,
  };

  return (
    <textarea
      ref={setRefs}
      className={className}
      id={id}
      name={name}
      value={current}
      rows={rows}
      maxLength={maxLength}
      onChange={(e) => {
        if (!isControlled) setInternal(e.target.value);
        onChange?.(e.target.value, e);
      }}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-invalid={invalid || undefined}
      aria-label={aria["aria-label"]}
      style={textareaStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
});
