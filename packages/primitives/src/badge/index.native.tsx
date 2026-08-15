/**
 * Badge (native). Pill matching the web tones. RN has no dashed inline
 * border in older targets, so ghost falls back to a solid hairline.
 */
import type { ReactNode } from "react";
import { Text, View, type ViewStyle } from "react-native";
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
  soft?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function Badge({ tone = "neutral", size = "md", soft, style, children }: BadgeProps) {
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

  const wrap: ViewStyle = {
    alignSelf: "flex-start",
    paddingVertical: dims.padY,
    paddingHorizontal: dims.padX,
    borderRadius: radius.pill,
    backgroundColor: soft ? withAlpha(fg, 0.12) : "transparent",
    borderWidth: soft ? 0 : 1,
    borderColor: tone === "neutral" ? colors.stroke : withAlpha(fg, 0.4),
    ...style,
  };

  return (
    <View style={wrap}>
      <Text style={{ fontSize: dims.fontSize, fontWeight: "600", color: tone === "neutral" ? colors.text : fg }}>
        {children}
      </Text>
    </View>
  );
}
