/**
 * Skeleton (web). Shimmer placeholder that holds layout while content
 * loads — a loading state that shows the shape of what's coming reads
 * faster than a spinner that shows nothing.
 *
 *   <Skeleton variant="text" lines={3} />
 *   <Skeleton variant="circle" width={40} />
 *   <Skeleton variant="rect" width="100%" height={120} />
 *
 * The shimmer is a linear-gradient sweep over containerFill, injected as
 * a page-level keyframe once (same pattern as Spinner). Reduced motion
 * renders a static fill — the placeholder still holds space, it just
 * doesn't move.
 */
import { type CSSProperties } from "react";
import { useTheme } from "@plyxui/styles";
import { radius } from "@plyxui/core";
import { useReducedMotion } from "@plyxui/hooks";

export type SkeletonVariant = "text" | "rect" | "circle";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  /** For variant="text": number of stacked lines. Last line is shorter. Default 1. */
  lines?: number;
  className?: string;
  style?: CSSProperties;
}

// Inject the keyframes once per page. Avoids a global stylesheet dependency.
const KEYFRAMES_ID = "plyxui-skeleton-keyframes";
function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
@keyframes plyxui-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}`;
  document.head.appendChild(style);
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  lines = 1,
  className,
  style,
}: SkeletonProps) {
  ensureKeyframes();
  const { colors } = useTheme();
  const reduced = useReducedMotion();

  const base: CSSProperties = reduced
    ? { background: colors.containerFill }
    : {
        background: `linear-gradient(90deg, ${colors.containerFill} 25%, ${colors.surfaceFill} 50%, ${colors.containerFill} 75%)`,
        backgroundSize: "200% 100%",
        animation: "plyxui-shimmer 1.6s linear infinite",
      };

  if (variant === "text" && lines > 1) {
    return (
      <div
        className={className}
        aria-hidden
        style={{ display: "flex", flexDirection: "column", gap: 8, width: width ?? "100%", ...style }}
      >
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            style={{
              ...base,
              height: height ?? "1em",
              borderRadius: radius.sm,
              width: i === lines - 1 ? "60%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  const dims: CSSProperties =
    variant === "circle"
      ? {
          width: width ?? 40,
          height: height ?? width ?? 40,
          borderRadius: radius.pill,
        }
      : variant === "text"
        ? { width: width ?? "100%", height: height ?? "1em", borderRadius: radius.sm }
        : { width: width ?? "100%", height: height ?? 16, borderRadius: radius.md };

  return <div className={className} aria-hidden style={{ ...base, ...dims, ...style }} />;
}
