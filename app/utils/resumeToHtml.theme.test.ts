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

  it("omitted style stays on the code layout", () => {
    const html = resumeToHtml(minimal, "dark");
    expect(html).toContain("/work experience");
    expect(html).toContain("Roboto Mono");
    expect(html).not.toContain('data-resume-style="harvard"');
  });

  it("harvard style is serif black and white without code chrome", () => {
    const html = resumeToHtml(
      {
        ...minimal,
        phone: "0900",
        email: "a@b.c",
        location: "Hanoi",
        gender: "M",
        avatar: "data:image/png;base64,xx",
        summary: "Builds things",
        workExperience: [
          {
            position: "Engineer",
            company: "Acme",
            period: "2020",
            description: '<span style="color:#ff0000">Shipped</span>',
          },
        ],
      },
      "dark",
      "harvard",
    );
    expect(html).toContain('data-resume-style="harvard"');
    expect(html).toContain("Source Serif 4");
    expect(html).toContain("#000000");
    expect(html).toContain(">SUMMARY<");
    expect(html).toContain(">EXPERIENCE<");
    expect(html).toContain("Acme");
    expect(html).toContain("0900 · a@b.c · Hanoi");
    expect(html).not.toContain("🏢");
    expect(html).not.toContain("data:image");
    expect(html).not.toContain("#2d3748");
    expect(html).not.toContain("#4fd1c7");
    expect(html).not.toContain("Gender");
  });
});
