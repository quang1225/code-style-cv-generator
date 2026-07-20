import { describe, expect, it } from "vitest";
import { resumeToHtml } from "./resumeToHtml";
import type { ResumeData } from "../types/resume";

const minimal: ResumeData = {
  name: "Test",
  title: "Dev",
  summary: "Hello",
  gender: "",
  phone: "",
  email: "",
  location: "",
  avatar: "",
  showCopyright: false,
  workExperience: [],
  customSections: [],
};

describe("resumeToHtml theme", () => {
  it("puts CSS vars on html/body and uses var(--resume-page-bg) for pdf-bg + content", () => {
    const html = resumeToHtml(minimal, "light");
    expect(html).toContain("--resume-page-bg:#ffffff");
    expect(html).toMatch(/html,\s*body\s*\{[^}]*--resume-page-bg/);
    expect(html).toContain("background-color: var(--resume-page-bg)");
    expect(html).toContain(".pdf-bg");
    expect(html).not.toContain("background-color: #2d3748");
  });

  it("dark theme injects dark pageBg", () => {
    const html = resumeToHtml(minimal, "dark");
    expect(html).toContain("--resume-page-bg:#2d3748");
    expect(html).toContain("--resume-accent-teal:#4fd1c7");
  });

  it("normalizes garbage theme to light", () => {
    const html = resumeToHtml(minimal, "system");
    expect(html).toContain("--resume-page-bg:#ffffff");
  });

  it("light theme adds B&W neutralize rules for Quill inline colors", () => {
    const html = resumeToHtml(minimal, "light");
    expect(html).toContain('data-resume-theme="light"');
    expect(html).toContain(
      'html[data-resume-theme="light"] .resume-rich-text *',
    );
    expect(html).toContain("color: inherit !important");
  });
});
