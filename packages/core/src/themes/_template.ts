/**
 * Copy this file, rename it to your GitHub handle, and change the values.
 *
 *   cp packages/core/src/themes/_template.ts packages/core/src/themes/your-handle.ts
 *
 * Files starting with an underscore are skipped, so this one is never part of the gallery.
 * Every field is optional except the three at the top: change one colour or change them
 * all, both are a real contribution.
 *
 * Every value is a { light, dark } pair. Pick both: a theme that only looks right in one
 * mode is half a theme, and the person reviewing it will ask.
 */
import type { Theme } from "./types";

const theme: Theme = {
  name: "Template",
  author: "your-handle",
  description: "Say in one line what you were going for.",
  colors: {
    primaryAccent: { light: "#5B54F0", dark: "#6366F1" },
    primaryOrange: { light: "#FF5C00", dark: "#FF5C00" },
  },
};

export default theme;
