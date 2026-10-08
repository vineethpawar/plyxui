import type { ColorPair, OmniColorTokens } from "../tokens/colors";

/**
 * A community theme: a name, who made it, and the colours it changes.
 *
 * `colors` is partial on purpose. A theme that only changes the accent is a real theme,
 * and asking a first-time contributor to restate all twelve tokens to change one of them
 * is how you get a pull request full of values nobody chose.
 */
export interface Theme {
  /** Shown in the gallery. Two or three words. */
  name: string;
  /** Your GitHub handle, so the credit survives the merge. */
  author: string;
  /** One line on what you were going for. */
  description: string;
  colors: Partial<Record<keyof OmniColorTokens, ColorPair>>;
}
