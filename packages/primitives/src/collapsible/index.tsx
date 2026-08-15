/**
 * Collapsible (web). A titled region that expands and collapses — the
 * building block for accordions and expandable resume sections. Height
 * animates via the grid-template-rows 0fr→1fr technique (real height,
 * no magic max-height guess), and the chevron rotates.
 *
 *   <Collapsible title="Experience" defaultOpen>…</Collapsible>
 *   <Collapsible title="Advanced" open={o} onOpenChange={setO}>…</Collapsible>
 */
import { useState, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "@plyxui/styles";
import { spacing } from "@plyxui/core";

export interface CollapsibleProps {
  title: ReactNode;
  /** Optional right-aligned adornment in the header (a count, a badge). */
  aside?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function Collapsible({
  title,
  aside,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  className,
  style,
  children,
}: CollapsibleProps) {
  const { colors } = useTheme();
  const [internal, setInternal] = useState<boolean>(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internal;

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!isOpen);
    onOpenChange?.(!isOpen);
  };

  return (
    <div className={className} style={style}>
      <button
        type="button"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={toggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: spacing[2],
          padding: `${spacing[3]}px 0`,
          background: "transparent",
          border: "none",
          cursor: disabled ? "default" : "pointer",
          font: "inherit",
          fontSize: 14,
          fontWeight: 600,
          color: colors.text,
          textAlign: "left",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRight: `1.5px solid ${colors.textMuted}`,
            borderBottom: `1.5px solid ${colors.textMuted}`,
            transform: isOpen ? "rotate(45deg)" : "rotate(-45deg)",
            transformOrigin: "center",
            transition: "transform 0.2s cubic-bezier(0.23,1,0.32,1)",
            marginRight: 2,
          }}
        />
        <span style={{ flex: 1 }}>{title}</span>
        {aside}
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.26s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div style={{ paddingBottom: isOpen ? spacing[3] : 0 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
