/**
 * Icon (native).
 *
 * Mirrors the web API but rebuilds via react-native-svg primitives.
 *
 * Imports are STATIC on purpose. This module is only ever resolved on
 * native platforms (the package's `react-native` exports condition),
 * where `react-native-svg` is a required peer — so there is nothing to
 * guard against. The previous lazy `require()` shape compiled into
 * tsup's `__require` interop shim, which Metro cannot statically
 * bundle: apps crashed at runtime with `Requiring unknown module
 * "react-native-svg"`. Static imports keep the dependency visible to
 * Metro's resolver.
 */
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";
import { useTheme } from "@plyxui/styles";
import { type OmniColorTokens } from "@plyxui/core";
import { getIcon, type IconElement, type IconName } from "./registry";

type ThemeColorKey = keyof OmniColorTokens;

export interface IconProps {
  name: IconName | (string & {});
  size?: number;
  color?: ThemeColorKey | (string & {});
  strokeWidth?: number;
  accessibilityLabel?: string;
}

function resolveColor(
  color: IconProps["color"],
  themeColors: Record<keyof OmniColorTokens, string>,
): string {
  if (!color) return themeColors.text;
  if ((themeColors as Record<string, string>)[color as string] != null) {
    return (themeColors as Record<string, string>)[color as string]!;
  }
  return color as string;
}

function renderElement(el: IconElement, key: number, props: Record<string, unknown>): React.ReactElement {
  switch (el.kind) {
    case "path":
      return <Path key={key} {...props} d={el.d} fillRule={el.fillRule} clipRule={el.clipRule} />;
    case "circle":
      return <Circle key={key} {...props} cx={el.cx} cy={el.cy} r={el.r} />;
    case "rect":
      return <Rect key={key} {...props} x={el.x} y={el.y} width={el.width} height={el.height} rx={el.rx} />;
    case "line":
      return <Line key={key} {...props} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} />;
    case "polyline":
      return <Polyline key={key} {...props} points={el.points} />;
  }
}

export function Icon({ name, size = 20, color, strokeWidth = 1.75, accessibilityLabel }: IconProps) {
  const { colors } = useTheme();
  const def = getIcon(name);

  if (!def) {
    return <Svg width={size} height={size} viewBox="0 0 24 24" />;
  }

  const resolved = resolveColor(color, colors);
  const filled = def.filled === true;
  const sharedProps: Record<string, unknown> = filled
    ? { fill: resolved }
    : {
        fill: "none",
        stroke: resolved,
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      };

  return (
    <Svg
      width={size}
      height={size}
      viewBox={def.viewBox ?? "0 0 24 24"}
      accessibilityLabel={accessibilityLabel}
    >
      {def.elements.map((el, i) => renderElement(el, i, sharedProps))}
    </Svg>
  );
}
