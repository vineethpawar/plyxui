/**
 * Segmented (web). A compact single-select control — a row of segments
 * with one active. For 2–4 mutually exclusive views (Review / Pack,
 * Edit / Score / Preview, theme mode). Sliding highlight tracks the
 * selection.
 *
 *   <Segmented value={tab} onChange={setTab}
 *     options={[{label:"Review",value:"review"},{label:"Pack",value:"pack"}]} />
 */
import { type CSSProperties } from "react";
import { useTheme } from "@plyxui/styles";
import { radius, spacing } from "@plyxui/core";

export type SegmentedSize = "sm" | "md";

export interface SegmentedOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: SegmentedSize;
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
}

const heightMap: Record<SegmentedSize, number> = { sm: 30, md: 36 };

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  fullWidth,
  className,
  style,
}: SegmentedProps<T>) {
  const { colors } = useTheme();
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const h = heightMap[size];

  return (
    <div
      className={className}
      role="tablist"
      style={{
        position: "relative",
        display: fullWidth ? "grid" : "inline-grid",
        gridTemplateColumns: `repeat(${options.length}, ${fullWidth ? "1fr" : "minmax(64px, auto)"})`,
        padding: 3,
        gap: 0,
        height: h,
        background: colors.containerFill,
        borderRadius: radius.md,
        ...style,
      }}
    >
      {/* sliding highlight */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 3,
          left: 3,
          bottom: 3,
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(${idx * 100}%)`,
          background: colors.surfaceFill,
          borderRadius: radius.sm,
          boxShadow: "0 1px 2px rgba(0,0,0,.08)",
          transition: "transform 0.22s cubic-bezier(0.23,1,0.32,1)",
        }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange(o.value)}
            style={{
              position: "relative",
              zIndex: 1,
              background: "transparent",
              border: "none",
              cursor: o.disabled ? "default" : "pointer",
              padding: `0 ${spacing[3]}px`,
              font: "inherit",
              fontSize: size === "sm" ? 12.5 : 13.5,
              fontWeight: 600,
              color: active ? colors.text : colors.textMuted,
              opacity: o.disabled ? 0.5 : 1,
              transition: "color 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
