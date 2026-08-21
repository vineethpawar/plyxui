/**
 * Skeleton (native). Same contract as web; the gradient sweep would need
 * a gradient dependency, so native pulses opacity on a containerFill block
 * instead — same "shape of what's coming" effect, zero new deps.
 *
 *   <Skeleton variant="text" lines={3} />
 *   <Skeleton variant="circle" width={40} />
 *
 * Reduced motion (AccessibilityInfo) renders a static fill.
 */
import { useEffect, useRef, type ReactElement } from "react";
import { Animated, View, type DimensionValue, type ViewStyle } from "react-native";
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
  style?: ViewStyle;
}

export function Skeleton({ variant = "rect", width, height, lines = 1, style }: SkeletonProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduced]);

  const block = (dims: ViewStyle, key?: number): ReactElement => (
    <Animated.View
      key={key}
      accessibilityElementsHidden
      style={[{ backgroundColor: colors.containerFill, opacity }, dims]}
    />
  );

  if (variant === "text" && lines > 1) {
    return (
      <View style={[{ gap: 8, width: (width as DimensionValue) ?? "100%" }, style]}>
        {Array.from({ length: lines }, (_, i) =>
          block(
            {
              height: (height as DimensionValue) ?? 14,
              borderRadius: radius.sm,
              width: i === lines - 1 ? "60%" : "100%",
            },
            i,
          ),
        )}
      </View>
    );
  }

  const dims: ViewStyle =
    variant === "circle"
      ? {
          width: (width as DimensionValue) ?? 40,
          height: (height as DimensionValue) ?? (width as DimensionValue) ?? 40,
          borderRadius: radius.pill,
        }
      : variant === "text"
        ? { width: (width as DimensionValue) ?? "100%", height: (height as DimensionValue) ?? 14, borderRadius: radius.sm }
        : { width: (width as DimensionValue) ?? "100%", height: (height as DimensionValue) ?? 16, borderRadius: radius.md };

  return (
    <Animated.View
      accessibilityElementsHidden
      style={[{ backgroundColor: colors.containerFill, opacity }, dims, style]}
    />
  );
}
