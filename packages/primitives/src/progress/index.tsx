/**
 * Progress (web). A horizontal meter. `value` is 0–1. The fill uses a
 * transform:scaleX transition (GPU-cheap, never animates width), so it
 * moves smoothly when the value updates live — score bars, completion.
 *
 *   <Progress value={0.76} />
 *   <Progress value={0.4} tone="warning" size="sm" />
 */
import type { CSSProperties } from "react";
import { useTheme } from "@plyxui/styles";
import { radius } from "@plyxui/core";

export type ProgressTone = "accent" | "success" | "warning" | "danger";
export type ProgressSize = "sm" | "md" | "lg";

const heightMap: Record<ProgressSize, number> = { sm: 5, md: 8, lg: 12 };

export interface ProgressProps {
  /** 0–1. Values outside are clamped. */
  value: number;
  tone?: ProgressTone;
  size?: ProgressSize;
  /** Override the fill color; wins over `tone`. */
  color?: string;
  trackColor?: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export function Progress({ value, tone = "accent", size = "md", color, trackColor, className, style, ...aria }: ProgressProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, value));

  const toneColor: Record<ProgressTone, string> = {
    accent: colors.primaryOrange,
    success: colors.statusSuccess,
    warning: colors.statusWarning,
    danger: colors.statusError,
  };
  const fill = color ?? toneColor[tone];
  const h = heightMap[size];

  return (
    <div
      className={className}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={aria["aria-label"]}
      style={{
        height: h,
        width: "100%",
        background: trackColor ?? colors.containerFill,
        borderRadius: radius.pill,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          background: fill,
          borderRadius: radius.pill,
          transformOrigin: "left",
          transform: `scaleX(${clamped})`,
          transition: "transform 0.28s cubic-bezier(0.23,1,0.32,1)",
        }}
      />
    </div>
  );
}
