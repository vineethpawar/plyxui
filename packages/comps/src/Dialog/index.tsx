/**
 * Dialog (web). The modal the library was missing — a focused decision
 * point that blocks the page behind one theme scrim, animates in on the
 * overlay motion tokens (scale 0.98 + fade via Presence), traps focus,
 * and hands focus back where it came from on close. Modal (the <dialog>
 * element wrapper) stays for simple cases; Dialog is the composed,
 * animated one.
 *
 *   <Dialog open={open} onClose={close} title="Delete project?" tone="danger">
 *     <Dialog.Description>This can't be undone.</Dialog.Description>
 *     <Dialog.Actions>
 *       <Button variant="ghost" onClick={close}>Cancel</Button>
 *       <Button onClick={confirm}>Delete</Button>
 *     </Dialog.Actions>
 *   </Dialog>
 *
 * The last child of Dialog.Actions is treated as the primary action;
 * tone="danger" recolors it (statusError) so destructive confirms read
 * as destructive without per-callsite styling.
 */
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTheme } from "@plyxui/styles";
import { Icon } from "@plyxui/icons";
import { Presence } from "@plyxui/primitives";
import { motion, radius, spacing } from "@plyxui/core";

export type DialogSize = "sm" | "md" | "lg" | "full";
export type DialogTone = "default" | "danger";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Renders a header with a close button and labels the dialog. */
  title?: ReactNode;
  /** Width preset or px. Default "md" (520). */
  size?: DialogSize | number;
  /** "danger" recolors the primary action in Dialog.Actions. Default "default". */
  tone?: DialogTone;
  /** Allow click-outside to close. Default true. */
  dismissOnBackdrop?: boolean;
  children?: ReactNode;
}

const sizePresets: Record<DialogSize, number | string> = {
  sm: 360,
  md: 520,
  lg: 720,
  full: "min(100vw - 48px, 1080px)",
};

interface DialogContextValue {
  tone: DialogTone;
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  size = "md",
  tone = "default",
  dismissOnBackdrop = true,
  children,
}: DialogProps) {
  const { colors } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Escape + focus trap + focus restore, alive for the whole open span.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Land focus inside the panel once it mounts.
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey, true);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  // Scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const widthValue = typeof size === "number" ? `${size}px` : sizePresets[size];

  const panelStyle: CSSProperties = {
    background: colors.surfaceFill,
    color: colors.text,
    borderRadius: radius.lg,
    width: widthValue,
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "min(90vh, 800px)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 72px rgba(0,0,0,0.35)",
    outline: "none",
    pointerEvents: "auto",
  };

  return (
    <DialogContext.Provider value={{ tone, titleId, descriptionId }}>
      <Presence
        present={open}
        from={{ opacity: 0 }}
        duration={motion.overlayEnter.duration}
        style={{ position: "fixed", inset: 0, background: colors.scrim, zIndex: 9000 }}
      />
      <Presence
        present={open}
        from={{ opacity: 0, scale: 0.98 }}
        style={{ position: "fixed", inset: 0, zIndex: 9001 }}
      >
        <div
          onMouseDown={(e) => {
            if (dismissOnBackdrop && e.target === e.currentTarget) onClose();
          }}
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            display: "grid",
            placeItems: "center",
            padding: spacing[5],
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            style={panelStyle}
          >
            {title ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: spacing[3],
                  padding: spacing[4],
                  borderBottom: `1px solid ${colors.stroke}`,
                }}
              >
                <div id={titleId} style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>
                  {title}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    color: colors.textMuted,
                    display: "inline-flex",
                  }}
                >
                  <Icon name="x" size={18} />
                </button>
              </div>
            ) : null}
            <div style={{ padding: spacing[4], overflow: "auto", flex: 1 }}>{children}</div>
          </div>
        </div>
      </Presence>
    </DialogContext.Provider>
  );
}

export interface DialogSectionProps {
  children?: ReactNode;
  style?: CSSProperties;
}

/** Heading inside the body — for dialogs that skip the `title` header. */
function DialogTitle({ children, style }: DialogSectionProps) {
  const ctx = useContext(DialogContext);
  return (
    <div id={ctx?.titleId} style={{ fontSize: 16, fontWeight: 600, marginBottom: spacing[2], ...style }}>
      {children}
    </div>
  );
}

function DialogDescription({ children, style }: DialogSectionProps) {
  const { colors } = useTheme();
  const ctx = useContext(DialogContext);
  return (
    <div
      id={ctx?.descriptionId}
      style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5, ...style }}
    >
      {children}
    </div>
  );
}

/**
 * Action row. Right-aligned; the LAST child is the primary action and
 * inherits the dialog's tone (tone="danger" injects variant="danger").
 */
function DialogActions({ children, style }: DialogSectionProps) {
  const ctx = useContext(DialogContext);
  const items = Children.toArray(children);
  const last = items[items.length - 1];
  if (ctx?.tone === "danger" && isValidElement(last)) {
    items[items.length - 1] = cloneElement(last as ReactElement<{ variant?: string }>, {
      variant: "danger",
    });
  }
  return (
    <div
      style={{
        display: "flex",
        gap: spacing[2],
        justifyContent: "flex-end",
        marginTop: spacing[4],
        ...style,
      }}
    >
      {items}
    </div>
  );
}

Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Actions = DialogActions;
