/**
 * Collapsible (native). Titled expand/collapse region. Uses
 * LayoutAnimation for a light height transition without pulling in
 * Reanimated; the chevron flips via a rotate transform.
 */
import { useState, type ReactNode } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@plyxui/styles";
import { spacing } from "@plyxui/core";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface CollapsibleProps {
  title: ReactNode;
  aside?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

export function Collapsible({
  title,
  aside,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  style,
  children,
}: CollapsibleProps) {
  const { colors } = useTheme();
  const [internal, setInternal] = useState<boolean>(defaultOpen ?? false);
  const isOpen = open ?? internal;

  const toggle = () => {
    if (disabled) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (open === undefined) setInternal(!isOpen);
    onOpenChange?.(!isOpen);
  };

  return (
    <View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen, disabled }}
        onPress={toggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[2],
          paddingVertical: spacing[3],
        }}
      >
        <Text style={{ color: colors.textMuted, transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}>▸</Text>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.text }}>{title}</Text>
        {aside}
      </Pressable>
      {isOpen ? <View style={{ paddingBottom: spacing[3] }}>{children}</View> : null}
    </View>
  );
}
