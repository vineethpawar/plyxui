/**
 * Segmented (native). Row of pressable segments; the active one gets a
 * raised surface. No sliding layer (RN layout math) — the active
 * background is enough and reads cleanly.
 */
import { Pressable, Text, View, type ViewStyle } from "react-native";
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
  style?: ViewStyle;
}

const heightMap: Record<SegmentedSize, number> = { sm: 30, md: 36 };

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  fullWidth,
  style,
}: SegmentedProps<T>) {
  const { colors } = useTheme();
  const h = heightMap[size];

  return (
    <View
      style={{
        flexDirection: "row",
        alignSelf: fullWidth ? "stretch" : "flex-start",
        height: h,
        padding: 3,
        backgroundColor: colors.containerFill,
        borderRadius: radius.md,
        ...style,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            disabled={o.disabled}
            onPress={() => !o.disabled && onChange(o.value)}
            style={{
              flex: fullWidth ? 1 : undefined,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: spacing[3],
              borderRadius: radius.sm,
              backgroundColor: active ? colors.surfaceFill : "transparent",
              opacity: o.disabled ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: size === "sm" ? 12.5 : 13.5,
                fontWeight: "600",
                color: active ? colors.text : colors.textMuted,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
