/**
 * Resume preview + PDF must share the same font stack so monospace and emoji
 * match. `--font-resume-mono` must match the literal in `app/layout.tsx`
 * `Roboto_Mono({ variable: "--font-resume-mono" })` (next/font requires a
 * written literal there, not an imported constant).
 */
export const RESUME_FONT_MONO_CSS_VAR = "--font-resume-mono";

const EMOJI_TAIL =
  "'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', " +
  "emoji, monospace";

/** Puppeteer HTML: literal names (Google Fonts in resumeToHtml `<head>`). */
export const RESUME_FONT_FAMILY_PDF = `'Roboto Mono', ${EMOJI_TAIL}`;

/** Next.js preview: optimized Roboto Mono variable + same emoji fallbacks as PDF. */
export const RESUME_FONT_FAMILY_PREVIEW = `var(${RESUME_FONT_MONO_CSS_VAR}), ${EMOJI_TAIL}`;
