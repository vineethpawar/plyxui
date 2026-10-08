/**
 * A worked example, so the folder is never empty and the shape is never in doubt.
 *
 * Cool greys with a single warm accent: the surface stays quiet so one colour can carry
 * every interactive thing on the page.
 */
import type { Theme } from "./types";

const theme: Theme = {
  name: "Pit Lane",
  author: "vineethpawar",
  description: "Cool grey surfaces with one warm accent doing all the work.",
  colors: {
    primaryFill: { light: "#EEF0F5", dark: "#0F1115" },
    surfaceFill: { light: "#FFFFFF", dark: "#171A1F" },
    containerFill: { light: "#E4E7EE", dark: "#1E2128" },
    stroke: { light: "#C9CEDA", dark: "#2A2F37" },
    text: { light: "#14171D", dark: "#EEF0F3" },
    textMuted: { light: "#5A6170", dark: "#9EA5AE" },
    primaryAccent: { light: "#245FD4", dark: "#6D9FFE" },
    primaryOrange: { light: "#DA6600", dark: "#FA7C20" },
  },
};

export default theme;
