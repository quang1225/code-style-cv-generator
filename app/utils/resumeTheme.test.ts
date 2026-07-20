import { describe, expect, it } from "vitest";
import {
  getResumeTheme,
  normalizeResumeTheme,
  resumeThemes,
  toResumeCssText,
  toResumeCssVarMap,
} from "./resumeTheme";

describe("normalizeResumeTheme", () => {
  it('returns "dark" only for "dark"', () => {
    expect(normalizeResumeTheme("dark")).toBe("dark");
  });

  it('returns "light" for light, system, undefined, and garbage', () => {
    expect(normalizeResumeTheme("light")).toBe("light");
    expect(normalizeResumeTheme("system")).toBe("light");
    expect(normalizeResumeTheme(undefined)).toBe("light");
    expect(normalizeResumeTheme(null)).toBe("light");
    expect(normalizeResumeTheme("nope")).toBe("light");
  });
});

describe("getResumeTheme", () => {
  it("defaults to light when id omitted", () => {
    expect(getResumeTheme()).toEqual(resumeThemes.light);
  });

  it("returns dark tokens", () => {
    expect(getResumeTheme("dark").pageBg).toBe("#2d3748");
    expect(getResumeTheme("dark").accentTeal).toBe("#4fd1c7");
  });
});

describe("toResumeCssVarMap / toResumeCssText", () => {
  it("maps camelCase tokens to --resume-* kebab vars", () => {
    const map = toResumeCssVarMap(resumeThemes.light);
    expect(map["--resume-page-bg"]).toBe("#ffffff");
    expect(map["--resume-muted-text"]).toBe("#333333");
    expect(map["--resume-accent-orange"]).toBe("#000000");
    expect(map["--resume-accent-teal"]).toBe("#000000");
  });

  it("toResumeCssText joins the same map (no duplicate keys)", () => {
    const map = toResumeCssVarMap(resumeThemes.dark);
    const text = toResumeCssText(resumeThemes.dark);
    for (const [key, value] of Object.entries(map)) {
      expect(text).toContain(`${key}:${value}`);
    }
  });
});
