/**
 * Toast (web). Renders the queue from `useToast()` as a stacked corner
 * pile — newest on top, up to three older toasts peeking behind it with a
 * scale/translate offset, and the whole stack expands into a column on
 * hover. Hovering also pauses every auto-dismiss timer (so does a hidden
 * tab); enter/exit run through the Presence primitive on motion tokens.
 *
 *   <ToastProvider>          // from @plyxui/hooks
 *     <App />
 *     <Toaster />
 *   </ToastProvider>
 *
 *   const { toast } = useToast();
 *   toast({ title: "Saved", variant: "success" });
 *   toast({ title: "Archived", action: { label: "Undo", onClick: restore } });
 *
 * Toasts with an `action` stick until dismissed. The renderer stays
 * separate from the queue so the same provider can power any visual —
 * a banner, a snackbar, a custom one the consumer writes themselves.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useToast, type ToastItem, type ToastVariant } from "@plyxui/hooks";
import { Presence } from "@plyxui/primitives";
import { useTheme } from "@plyxui/styles";
import { motion, radius, spacing, transition } from "@plyxui/core";

export type ToasterPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export interface ToasterProps {
  /** Where the stack lives. Default "bottom-right". */
  position?: ToasterPosition;
  /** Pixel offset from the chosen corner. Default 16. */
  offset?: number;
  /** Cap rendered toasts. Older ones animate out. Default 5. */
  max?: number;
  /** Override per-variant accent (orange/green/red). */
  accent?: Partial<Record<ToastVariant, string>>;
  /** Stack width in px. Default 356. */
  width?: number;
}

/** Vertical peek per stacked toast while collapsed. */
const PEEK = 12;
/** How many older toasts stay visible behind the front one. */
const VISIBLE_BEHIND = 3;
/** Gap between toasts when the stack is expanded. */
const GAP = spacing[2];

export function Toaster({
  position = "bottom-right",
  offset = 16,
  max = 5,
  accent,
  width = 356,
}: ToasterProps) {
  const { toasts, pauseAll, resumeAll } = useToast();
  const live = toasts.slice(-max);

  // Local render list so a dismissed toast stays mounted through its exit
  // animation; Presence flips `present` off and we drop it on completion.
  const [rendered, setRendered] = useState<ToastItem[]>(live);
  useEffect(() => {
    setRendered((prev) => {
      const prevIds = new Set(prev.map((t) => t.id));
      const liveById = new Map(live.map((t) => [t.id, t]));
      // Refresh snapshots of live toasts, keep exiting ones, append new ones.
      const kept = prev.map((t) => liveById.get(t.id) ?? t);
      const added = live.filter((t) => !prevIds.has(t.id));
      return [...kept, ...added];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts, max]);

  const removeRendered = useCallback((id: string) => {
    setRendered((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [expanded, setExpanded] = useState(false);
  const hovered = useRef(false);

  // A hidden tab shouldn't burn through toast timers.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = () => {
      if (document.hidden) pauseAll();
      else if (!hovered.current) resumeAll();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pauseAll, resumeAll]);

  // Measured card heights drive the expanded offsets.
  const heights = useRef<Map<string, number>>(new Map());
  const [, bumpMeasure] = useState(0);
  const measure = useCallback((id: string, h: number) => {
    if (heights.current.get(id) !== h) {
      heights.current.set(id, h);
      bumpMeasure((n) => n + 1);
    }
  }, []);

  const isBottom = position.startsWith("bottom");
  const liveIds = new Set(live.map((t) => t.id));
  // Front order: index 0 = newest.
  const front = [...rendered].reverse();

  const heightOf = (id: string) => heights.current.get(id) ?? 0;
  const expandedOffset = (i: number) =>
    front.slice(0, i).reduce((sum, t) => sum + heightOf(t.id) + GAP, 0);

  const frontHeight = front.length > 0 ? heightOf(front[0]!.id) : 0;
  const stackHeight = expanded
    ? expandedOffset(front.length)
    : frontHeight + PEEK * Math.max(0, Math.min(front.length, VISIBLE_BEHIND + 1) - 1);

  const containerStyle: CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    width,
    maxWidth: `calc(100vw - ${offset * 2}px)`,
    height: stackHeight,
    pointerEvents: front.length > 0 ? "auto" : "none",
    ...edge(position, offset),
  };

  return (
    <div
      style={containerStyle}
      aria-live="polite"
      aria-relevant="additions"
      onMouseEnter={() => {
        hovered.current = true;
        setExpanded(true);
        pauseAll();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        setExpanded(false);
        resumeAll();
      }}
    >
      {front.map((t, i) => {
        const y = expanded ? expandedOffset(i) : i * PEEK;
        const scale = expanded ? 1 : Math.max(0, 1 - i * 0.05);
        const hidden = !expanded && i > VISIBLE_BEHIND; // front + 3 peeking
        return (
          <div
            key={t.id}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              ...(isBottom ? { bottom: 0 } : { top: 0 }),
              transform: `translateY(${isBottom ? -y : y}px) scale(${scale})`,
              transformOrigin: isBottom ? "center bottom" : "center top",
              zIndex: front.length - i,
              opacity: hidden ? 0 : 1,
              pointerEvents: hidden ? "none" : "auto",
              transition: [
                transition("transform", motion.expand),
                transition("opacity", motion.expand),
              ].join(", "),
            }}
          >
            <Presence
              present={liveIds.has(t.id)}
              from={{ opacity: 0, translateY: isBottom ? 16 : -16 }}
              onExitComplete={() => removeRendered(t.id)}
            >
              <ToastCard item={t} accent={accent} onHeight={(h) => measure(t.id, h)} />
            </Presence>
          </div>
        );
      })}
    </div>
  );
}

function edge(pos: ToasterPosition, off: number): CSSProperties {
  const s: CSSProperties = {};
  if (pos.startsWith("top")) s.top = off;
  else s.bottom = off;
  if (pos.endsWith("left")) s.left = off;
  else if (pos.endsWith("right")) s.right = off;
  else {
    s.left = "50%";
    s.transform = "translateX(-50%)";
  }
  return s;
}

function ToastCard({
  item,
  accent,
  onHeight,
}: {
  item: ToastItem;
  accent?: Partial<Record<ToastVariant, string>>;
  onHeight: (h: number) => void;
}): ReactNode {
  const { colors } = useTheme();
  const { dismiss } = useToast();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) onHeight(ref.current.offsetHeight);
  });

  const variant = item.variant ?? "default";
  const fallback: Record<ToastVariant, string> = {
    default: colors.primaryOrange,
    success: colors.statusSuccess,
    warning: colors.statusWarning,
    error: colors.statusError,
  };
  const accentColor = accent?.[variant] ?? fallback[variant];

  return (
    <div
      ref={ref}
      role="status"
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        background: colors.surfaceFill,
        color: colors.text,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: radius.md,
        padding: `${spacing[3]}px ${spacing[4]}px`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      {item.title ? (
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: item.description ? 2 : 0, paddingRight: spacing[5] }}>
          {item.title}
        </div>
      ) : null}
      {item.description ? (
        <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.4 }}>
          {item.description}
        </div>
      ) : null}
      {item.action ? (
        <button
          onClick={() => {
            item.action?.onClick();
            dismiss(item.id);
          }}
          style={{
            marginTop: spacing[2],
            background: "transparent",
            border: `1px solid ${colors.stroke}`,
            borderRadius: radius.sm,
            color: accentColor,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "inherit",
            padding: `${spacing[1]}px ${spacing[2]}px`,
            cursor: "pointer",
          }}
        >
          {item.action.label}
        </button>
      ) : null}
      <button
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          top: 6,
          right: 8,
          background: "transparent",
          border: "none",
          color: colors.textMuted,
          fontSize: 16,
          lineHeight: 1,
          cursor: "pointer",
          padding: 4,
        }}
      >
        x
      </button>
    </div>
  );
}
