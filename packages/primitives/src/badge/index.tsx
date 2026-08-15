/**
 * Badge (web). A small pill for status, tags, and counts. Tone-driven:
 * accent for emphasis, semantic tones for status, ghost for a dashed
 * outline. `soft` fills with a tinted background instead of a border.
 *
 *   <Badge tone="accent">Promoted</Badge>
 *   <Badge tone="success" soft>ATS-safe</Badge>
 *   <Badge tone="ghost">OTIF</Badge>
 */
import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "@plyxui/styles";
import { radius, spacing } from "@plyxui/core";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "ghost";
export type BadgeSize = "sm" | "md";

const sizeMap: Record<BadgeSize, { fontSize: number; padY: number; padX: number }> = {
  sm: { fontSize: 11, padY: 2, padX: spacing[2] },
  md: { fontSize: 12, padY: 4, padX: spacing[3] },
};

export interface BadgeProps {
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Filled tinted background instead of a bordered outline. */
  soft?: boolean;
  leading?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function Badge({ tone = "neutral", size = "md", soft, leading, className, style, children }: BadgeProps) {
  const { colors } = useTheme();
  const dims = sizeMap[size];

  const toneColor: Record<BadgeTone, string> = {
    neutral: colors.textMuted,
    accent: colors.primaryOrange,
    success: colors.statusSuccess,
    warning: colors.statusWarning,
    danger: colors.statusError,
    ghost: colors.textMuted,
  };
  const fg = toneColor[tone];

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: dims.fontSize,
    fontWeight: 600,
    lineHeight: 1.2,
    padding: `${dims.padY}px ${dims.padX}px`,
    borderRadius: radius.pill,
    whiteSpace: "nowrap",
    color: tone === "neutral" ? colors.text : fg,
    background: soft ? withAlpha(fg, 0.12) : "transparent",
    border: soft
      ? "1px solid transparent"
      : `1px ${tone === "ghost" ? "dashed" : "solid"} ${tone === "neutral" ? colors.stroke : withAlpha(fg, 0.4)}`,
    ...style,
  };

  return (
    <span className={className} style={base}>
      {leading}
      {children}
    </span>
  );
}
