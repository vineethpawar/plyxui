/**
 * Switch (web). A binary toggle — the on/off sibling of Checkbox, for
 * settings and instant-apply options. Track fills with the accent when
 * on; the thumb slides with a short ease-out.
 *
 *   <Switch checked={on} onChange={setOn} />
 *   <Switch defaultChecked label="Open to relocation" />
 */
import { useState, type CSSProperties, type ReactNode } from "react";
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
  id?: string;
  "aria-label"?: string;
}

export function Switch({ checked, defaultChecked, onChange, disabled, size = "md", label, id, ...aria }: SwitchProps) {
  const { colors } = useTheme();
  const [internal, setInternal] = useState<boolean>(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const dims = sizeMap[size];

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange?.(!on);
  };

  const track: CSSProperties = {
    width: dims.w,
    height: dims.h,
    borderRadius: dims.h,
    background: on ? colors.primaryOrange : colors.stroke,
    border: "none",
    position: "relative",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transition: "background 0.2s cubic-bezier(0.23,1,0.32,1)",
    flex: "none",
    padding: 0,
  };
  const thumb: CSSProperties = {
    position: "absolute",
    top: dims.pad,
    left: dims.pad,
    width: dims.thumb,
    height: dims.thumb,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,.25)",
    transform: on ? `translateX(${dims.w - dims.thumb - dims.pad * 2}px)` : "translateX(0)",
    transition: "transform 0.2s cubic-bezier(0.23,1,0.32,1)",
  };

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={aria["aria-label"]}
      id={id}
      disabled={disabled}
      onClick={toggle}
      style={track}
    >
      <span style={thumb} />
    </button>
  );

  if (!label) return control;
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "default" : "pointer" }}>
      {control}
      <span style={{ fontSize: 14, color: colors.text }}>{label}</span>
    </label>
  );
}
