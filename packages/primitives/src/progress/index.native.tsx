/**
 * Progress (native). Horizontal meter matching the web shape. RN fills
 * by width fraction inside a rounded track.
 */
import { View, type ViewStyle } from "react-native";
import { useTheme } from "@plyxui/styles";
import { radius } from "@plyxui/core";

export type ProgressTone = "accent" | "success" | "warning" | "danger";
export type ProgressSize = "sm" | "md" | "lg";

const heightMap: Record<ProgressSize, number> = { sm: 5, md: 8, lg: 12 };

export interface ProgressProps {
  value: number;
  tone?: ProgressTone;
  size?: ProgressSize;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
}

export function Progress({ value, tone = "accent", size = "md", color, trackColor, style }: ProgressProps) {
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
    <View
      style={{
        height: h,
        width: "100%",
        backgroundColor: trackColor ?? colors.containerFill,
        borderRadius: radius.pill,
        overflow: "hidden",
        ...style,
      }}
    >
      <View style={{ height: "100%", width: `${clamped * 100}%`, backgroundColor: fill, borderRadius: radius.pill }} />
    </View>
  );
}
