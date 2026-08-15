/**
 * Card (native). Bordered surface matching the web shape. Interactive
 * cards render as a Pressable.
 */
import { forwardRef, type ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "@plyxui/styles";
import { radius as radiusScale, spacing } from "@plyxui/core";

export type CardVariant = "outline" | "raised" | "sunken";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "sm" | "md" | "lg" | "xl";

const padMap: Record<CardPadding, number> = {
  none: 0,
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
};

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  children?: ReactNode;
}

export const Card = forwardRef<View, CardProps>(function Card(
  { variant = "outline", padding = "md", radius = "lg", onPress, style, children },
  ref,
) {
  const { colors } = useTheme();
  const bg = variant === "sunken" ? colors.containerFill : colors.surfaceFill;

  const base: ViewStyle = {
    backgroundColor: bg,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: radiusScale[radius],
    padding: padMap[padding],
    ...style,
  };

  if (onPress) {
    return (
      <Pressable ref={ref} onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }
  return (
    <View ref={ref} style={base}>
      {children}
    </View>
  );
});
