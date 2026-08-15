/**
 * Switch (native). Toggle matching the web shape; thumb slides via a
 * state-driven translateX (no Reanimated dependency).
 */
import { useState, type ReactNode } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "@plyxui/styles";

export type SwitchSize = "sm" | "md";

const sizeMap: Record<SwitchSize, { w: number; h: number; thumb: number; pad: number }> = {
  sm: { w: 34, h: 20, thumb: 14, pad: 3 },
  md: { w: 44, h: 26, thumb: 20, pad: 3 },
};

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  label?: ReactNode;
}

export function Switch({ checked, defaultChecked, onChange, disabled, size = "md", label }: SwitchProps) {
  const { colors } = useTheme();
  const [internal, setInternal] = useState<boolean>(defaultChecked ?? false);
  const on = checked ?? internal;
  const dims = sizeMap[size];

  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInternal(!on);
    onChange?.(!on);
  };

  const track: ViewStyle = {
    width: dims.w,
    height: dims.h,
    borderRadius: dims.h,
    backgroundColor: on ? colors.primaryOrange : colors.stroke,
    opacity: disabled ? 0.55 : 1,
    justifyContent: "center",
    padding: dims.pad,
  };
  const thumb: ViewStyle = {
    width: dims.thumb,
    height: dims.thumb,
    borderRadius: dims.thumb / 2,
    backgroundColor: "#fff",
    transform: [{ translateX: on ? dims.w - dims.thumb - dims.pad * 2 : 0 }],
  };

  const control = (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled }}
      onPress={toggle}
      style={track}
    >
      <View style={thumb} />
    </Pressable>
  );

  if (!label) return control;
  return (
    <Pressable onPress={toggle} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {control}
      <Text style={{ fontSize: 14, color: colors.text }}>{label}</Text>
    </Pressable>
  );
}
