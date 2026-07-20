export type ResumeThemeId = "light" | "dark";

export type ResumeThemeTokens = {
  pageBg: string;
  text: string;
  mutedText: string;
  bodyText: string;
  accentOrange: string;
  accentGreen: string;
  accentPurple: string;
  accentRed: string;
  accentBlue: string;
  accentTeal: string;
  border: string;
  copyright: string;
};

export const resumeThemes = {
  dark: {
    pageBg: "#2d3748",
    text: "#ffffff",
    mutedText: "#9ca3af",
    bodyText: "#d1d5db",
    accentOrange: "#fb923c",
    accentGreen: "#4ade80",
    accentPurple: "#8b5cf6",
    accentRed: "#ef4444",
    accentBlue: "#3b82f6",
    accentTeal: "#4fd1c7",
    border: "#4b5563",
    copyright: "#4b5563",
  },
  light: {
    // Grayscale for non-color printing; formatting (bold/italic/etc.) unchanged.
    pageBg: "#ffffff",
    text: "#000000",
    mutedText: "#333333",
    bodyText: "#111111",
    accentOrange: "#000000",
    accentGreen: "#000000",
    accentPurple: "#000000",
    accentRed: "#000000",
    accentBlue: "#000000",
    accentTeal: "#000000",
    border: "#cccccc",
    copyright: "#666666",
  },
} satisfies Record<ResumeThemeId, ResumeThemeTokens>;

export function normalizeResumeTheme(value: unknown): ResumeThemeId {
  return value === "dark" ? "dark" : "light";
}

export function getResumeTheme(id?: ResumeThemeId): ResumeThemeTokens {
  return resumeThemes[id ?? "light"];
}

function tokenKeyToCssVar(key: string): string {
  // pageBg -> --resume-page-bg; accentOrange -> --resume-accent-orange
  const kebab = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  return `--resume-${kebab}`;
}

export function toResumeCssVarMap(
  tokens: ResumeThemeTokens,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    out[tokenKeyToCssVar(key)] = value;
  }
  return out;
}

export function toResumeCssText(tokens: ResumeThemeTokens): string {
  return Object.entries(toResumeCssVarMap(tokens))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}
