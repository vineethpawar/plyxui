/**
 * Textarea (native). Multi-line TextInput matching the web shape.
 * RN grows multiline inputs with content on its own, so there's no
 * scrollHeight dance -- minHeight from rows sets the floor.
 */
import { forwardRef, useState } from "react";
import { TextInput, type TextInputProps, type TextStyle } from "react-native";
import { useTheme } from "@plyxui/styles";
import { radius, spacing } from "@plyxui/core";

export type TextareaSize = "sm" | "md" | "lg";

const sizeMap: Record<TextareaSize, { fontSize: number; padX: number; padY: number; lineHeight: number }> = {
  sm: { fontSize: 13, padX: spacing[2], padY: spacing[2], lineHeight: 18 },
  md: { fontSize: 14, padX: spacing[3], padY: spacing[3], lineHeight: 21 },
  lg: { fontSize: 16, padX: spacing[4], padY: spacing[3], lineHeight: 24 },
};

export interface TextareaProps extends Omit<TextInputProps, "style" | "onChange" | "multiline"> {
  value?: string;
  onChange?: (value: string) => void;
  size?: TextareaSize;
  invalid?: boolean;
  disabled?: boolean;
  /** Visible rows at rest (sets minHeight). Default 3. */
  rows?: number;
  style?: TextStyle;
}

export const Textarea = forwardRef<TextInput, TextareaProps>(function Textarea(
  { value, onChange, size = "md", invalid, disabled, rows = 3, style, defaultValue, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [internal, setInternal] = useState<string>(defaultValue ?? "");
  const current = value ?? internal;
  const dims = sizeMap[size];

  const boxStyle: TextStyle = {
    minHeight: rows * dims.lineHeight + dims.padY * 2,
    paddingHorizontal: dims.padX,
    paddingVertical: dims.padY,
    backgroundColor: colors.surfaceFill,
    borderWidth: 1,
    borderColor: invalid ? colors.statusError : colors.stroke,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: dims.fontSize,
    lineHeight: dims.lineHeight,
    opacity: disabled ? 0.55 : 1,
    textAlignVertical: "top",
    ...style,
  };

  return (
    <TextInput
      ref={ref}
      multiline
      editable={!disabled}
      value={current}
      onChangeText={(t) => {
        if (value === undefined) setInternal(t);
        onChange?.(t);
      }}
      placeholderTextColor={colors.textMuted}
      style={boxStyle}
      {...rest}
    />
  );
});
