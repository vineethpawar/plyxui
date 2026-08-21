/**
 * Popover (web). One floating-panel primitive to replace the ad-hoc
 * absolutely-positioned panels scattered through consumer code. No portal
 * and no positioning engine on purpose — the panel positions absolutely
 * inside a wrapping `position: relative` container that also holds the
 * trigger, which covers menus, pickers, and filter panels without a
 * dependency.
 *
 *   <div style={{ position: "relative" }}>
 *     <Button ref={anchorRef} onClick={() => setOpen(true)}>Filter</Button>
 *     <Popover open={open} onClose={close} anchor={anchorRef}>…</Popover>
 *   </div>
 *
 *   <Popover open={open} onClose={close} anchor={anchorRef} placement="bottom-end">…</Popover>
 *
 * Outside-mousedown and Escape both close it; Escape also hands focus
 * back to the anchor (an outside click already moved focus deliberately).
 * Enter/exit are a fade + 4px slide through Presence on the motion tokens.
 */
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useTheme } from "@plyxui/styles";
import { Presence } from "@plyxui/primitives";
import { radius, spacing } from "@plyxui/core";

export type PopoverPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /** The trigger element — excluded from outside-click, focused on Escape close. */
  anchor: RefObject<HTMLElement | null>;
  /** Corner of the relative container the panel hangs from. Default "bottom-start". */
  placement?: PopoverPlacement;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const GAP = spacing[1];

function place(placement: PopoverPlacement): CSSProperties {
  switch (placement) {
    case "bottom-start":
      return { top: `calc(100% + ${GAP}px)`, left: 0 };
    case "bottom-end":
      return { top: `calc(100% + ${GAP}px)`, right: 0 };
    case "top-start":
      return { bottom: `calc(100% + ${GAP}px)`, left: 0 };
    case "top-end":
      return { bottom: `calc(100% + ${GAP}px)`, right: 0 };
  }
}

export function Popover({
  open,
  onClose,
  anchor,
  placement = "bottom-start",
  className,
  style,
  children,
}: PopoverProps) {
  const { colors } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchor.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
      anchor.current?.focus?.();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, onClose, anchor]);

  const isTop = placement.startsWith("top");

  return (
    <Presence
      present={open}
      from={{ opacity: 0, translateY: isTop ? 4 : -4 }}
      className={className}
      style={{
        position: "absolute",
        zIndex: 1000,
        ...place(placement),
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        style={{
          minWidth: 180,
          background: colors.surfaceFill,
          color: colors.text,
          border: `1px solid ${colors.stroke}`,
          borderRadius: radius.md,
          padding: spacing[3],
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
          ...style,
        }}
      >
        {children}
      </div>
    </Presence>
  );
}
