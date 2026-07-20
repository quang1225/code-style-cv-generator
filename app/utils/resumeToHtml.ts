import { ResumeData } from "../types/resume";
import {
  normalizeNbsp,
  preserveHyphenBreaks,
  preserveHyphenBreaksInHtml,
} from "./preserveHyphenBreaks";
import { RESUME_FONT_FAMILY_PDF } from "./resumeFontFamily";
import {
  getResumeTheme,
  normalizeResumeTheme,
  toResumeCssText,
} from "./resumeTheme";

const RESUME_CSS = (cssVars: string) => `
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    /* Highest-fidelity glyph rendering for the PDF: enable kerning, common
       ligatures, contextual alternates and grayscale smoothing. */
    font-kerning: normal;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  img { image-rendering: auto; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: ${RESUME_FONT_FAMILY_PDF};
    ${cssVars};
    background-color: var(--resume-page-bg) !important;
    min-height: 100vh;
  }
  @page { size: A4; margin: 0; }
  .pdf-bg {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background-color: var(--resume-page-bg);
    z-index: -1;
  }
  #resume-content {
    background-color: var(--resume-page-bg);
    color: var(--resume-accent-teal);
    padding: 1.5rem;
    min-height: 1122px;
    min-width: 794px;
    width: 794px;
    max-width: 100%;
    font-size: 12px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    -webkit-hyphens: none;
    hyphens: none;
    word-break: normal;
  }
  .resume-rich-text {
    font-size: 11px;
    line-height: 1.625;
    color: var(--resume-body-text);
    overflow-wrap: break-word;
    word-wrap: break-word;
    max-width: 100%;
    -webkit-hyphens: none;
    hyphens: none;
    word-break: normal;
  }
  .resume-rich-text strong { font-weight: bold; }
  .resume-rich-text em { font-style: italic; }
  .resume-rich-text p { margin: 0; padding: 0; display: block; }
  .resume-rich-text p:not(:first-child) { margin-top: 0.5em; }
  .resume-rich-text p:empty,
  .resume-rich-text p:has(br:only-child) { min-height: 1em; }
  .resume-rich-text br { display: block; margin: 0.25em 0; }
  .resume-rich-text .line-break-spacer { display: block; height: 0.5em; }
  .resume-rich-text .resume-spacer { min-height: 1em; }
  .resume-rich-text a { color: var(--resume-accent-blue); text-decoration: underline; text-decoration-thickness: 1px; overflow-wrap: anywhere; }
  .copyright-link { color: inherit !important; text-decoration: underline; text-decoration-thickness: 1px; overflow-wrap: anywhere; }
  /* Light = B&W: neutralize Quill inline colors (bold/italic/underline stay). */
  html[data-resume-theme="light"] .resume-rich-text,
  html[data-resume-theme="light"] .resume-rich-text * {
    color: inherit !important;
    background-color: transparent !important;
  }
  html[data-resume-theme="light"] .resume-rich-text {
    color: var(--resume-body-text) !important;
  }
  html[data-resume-theme="light"] .resume-rich-text a {
    color: var(--resume-accent-blue) !important;
  }
  .resume-rich-text .ql-indent-1 { padding-left: 2em; }
  .resume-rich-text .ql-indent-2 { padding-left: 4em; }
  .resume-rich-text .ql-indent-3 { padding-left: 6em; }
  .resume-rich-text .ql-indent-4 { padding-left: 8em; }
  .resume-rich-text .ql-indent-5 { padding-left: 10em; }
  .text-orange { color: var(--resume-accent-orange); }
  .text-white { color: var(--resume-text); }
  .text-gray-300 { color: var(--resume-body-text); }
  .text-gray-400 { color: var(--resume-muted-text); }
  .text-gray-600 { color: var(--resume-copyright); }
  .text-green { color: var(--resume-accent-green); }
  .text-purple { color: var(--resume-accent-purple); }
  .text-red { color: var(--resume-accent-red); }
  .text-blue { color: var(--resume-accent-blue); }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .flex-1 { flex: 1; min-width: 0; }
  .flex-6 { flex: 6; }
  .flex-4 { flex: 4; }
  .gap-4 { gap: 1rem; }
  .gap-5 { gap: 1.25rem; }
  .gap-2 { gap: 0.5rem; }
  .space-y-4 > * + * { margin-top: 1rem; }
  .space-y-3 > * + * { margin-top: 0.75rem; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-5 { margin-bottom: 1.25rem; }
  .mb-0\.5 { margin-bottom: 0.125rem; }
  .min-w-0 { min-width: 0; }
  .whitespace-nowrap { white-space: nowrap; }
  .shrink-0 { flex-shrink: 0; }
  .title-period-row { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
  .title-period-row .title { flex: 1; min-width: 0; font-weight: 600; font-size: 12px; overflow-wrap: break-word; word-wrap: break-word; -webkit-hyphens: none; hyphens: none; word-break: normal; }
  .title-period-row .period { flex-shrink: 0; white-space: nowrap; font-weight: bold; font-size: 12px; }
  .period-item { border-bottom: 1px solid var(--resume-border); padding-bottom: 1.25rem; }
  .period-item:last-child { border-bottom: none; padding-bottom: 0; }
`;

function escapeHtml(text: string): string {
  return preserveHyphenBreaks(normalizeNbsp(text))
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const LINE_BREAK_SPACER =
  '<span class="line-break-spacer" style="display:block;height:0.5em;"></span>';

function normalizeHtml(html: string): string {
  return preserveHyphenBreaksInHtml(normalizeNbsp(html))
    .replace(/\n/g, "<br>")
    .replace(/<p>\s*<br>\s*<\/p>/gi, '<p class="resume-spacer">&nbsp;</p>')
    .replace(/<p>\s*<\/p>/g, '<p class="resume-spacer">&nbsp;</p>')
    .replace(/<br>\s*<br>/gi, `<br>${LINE_BREAK_SPACER}<br>`);
}

function formatContent(text: string): string {
  if (!text || typeof text !== "string") return "";
  if (text.includes("<")) {
    return normalizeHtml(text);
  }
  return escapeHtml(text)
    .replace(/\n/g, "<br>")
    .replace(/<br>\s*<br>/gi, `<br>${LINE_BREAK_SPACER}<br>`);
}

export function resumeToHtml(data: ResumeData, theme?: unknown): string {
  const resumeTheme = normalizeResumeTheme(theme);
  const tokens = getResumeTheme(resumeTheme);
  const cssVars = toResumeCssText(tokens);

  const workExpHtml = (data.workExperience ?? [])
    .map(
      (job, index) => `
      <div class="${index < (data.workExperience?.length ?? 1) - 1 ? "period-item" : ""}">
        <div class="mb-1">
          <div class="title-period-row mb-0.5">
            <span class="title text-white">${escapeHtml(job.position)}</span>
            <span class="period text-purple">${escapeHtml(job.period)}</span>
          </div>
          <p class="text-gray-400" style="font-size: 12px; overflow-wrap: break-word; word-wrap: break-word;">
            <span class="text-red font-semibold">🏢 ${escapeHtml(job.company)}</span>
          </p>
        </div>
        <div class="resume-rich-text text-gray-300" style="font-size: 11px; line-height: 1.625;">
          ${formatContent(job.description)}
        </div>
      </div>
    `,
    )
    .join("");

  const customSectionsHtml = (data.customSections ?? [])
    .map(
      (section) => `
      <section>
        <h2 class="text-orange font-bold mb-2" style="font-size: 14px;">/${escapeHtml(section.title).toLowerCase()}</h2>
        <div class="space-y-3">
          ${(section.items ?? [])
            .map(
              (item, itemIndex) => `
            <div class="${itemIndex < (section.items?.length ?? 1) - 1 ? "mb-3 period-item" : "mb-3"}">
              <div class="mb-1">
                <div class="title-period-row mb-0.5">
                  ${item.title ? `<span class="title text-white">${escapeHtml(item.title)}</span>` : '<span class="title"></span>'}
                  ${item.period ? `<span class="period text-purple">${escapeHtml(item.period)}</span>` : ""}
                </div>
              </div>
              ${item.description ? `<div class="resume-rich-text text-gray-300" style="font-size: 11px; line-height: 1.625;">${formatContent(item.description)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      </section>
    `,
    )
    .join("");

  const basicInfoHtml = [
    data.gender && `👤 Gender: ${escapeHtml(data.gender)}`,
    data.phone && `📱 Phone: ${escapeHtml(data.phone)}`,
    data.email && `📧 Email: ${escapeHtml(data.email)}`,
    data.location && `📍 Location: ${escapeHtml(data.location)}`,
  ]
    .filter(Boolean)
    .map((line) => `<div>${line}</div>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="en" data-resume-theme="${resumeTheme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&amp;family=Noto+Color+Emoji&amp;display=swap" rel="stylesheet">
  <style>${RESUME_CSS(cssVars)}</style>
</head>
<body>
  <div class="pdf-bg" aria-hidden="true"></div>
  <div id="resume-content" data-resume-theme="${resumeTheme}">
    ${
      data.showCopyright
        ? `
    <div style="position: absolute; top: 0.5rem; left: 50%; transform: translateX(-50%); font-size: 10px; color: var(--resume-copyright); z-index: 10;">
      CV made with <a href="https://code-style-cv-generator.quang.work" class="copyright-link" target="_blank" rel="noopener">https://code-style-cv-generator.quang.work</a>
    </div>
    `
        : ""
    }
    <div>
      <div class="mb-5">
        <div class="flex gap-4 mb-3" style="flex-wrap: wrap; align-items: center;">
          <div class="shrink-0">
            ${data.avatar ? `<img src="${data.avatar}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--resume-accent-green);">` : `<div style="width: 80px; height: 80px; border-radius: 50%; background: var(--resume-border); border: 2px solid var(--resume-accent-green);"></div>`}
          </div>
          <div class="flex-1">
            <div class="mb-1" style="font-size: 24px; font-weight: bold;">
              <span class="text-green">&lt;</span><span class="text-white">CV</span><span class="text-green">&gt;</span>
            </div>
            <div class="text-white font-bold" style="font-size: 20px; overflow-wrap: break-word; word-wrap: break-word;">${escapeHtml(data.name)}</div>
            <div class="text-gray-400" style="font-size: 12px; overflow-wrap: break-word; word-wrap: break-word;">${escapeHtml(data.title)}</div>
          </div>
          <div class="resume-basic-info" style="font-size: 11px; color: var(--resume-body-text); display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; flex-shrink: 1; max-width: 42%; overflow-wrap: break-word; word-wrap: break-word;">
            ${basicInfoHtml}
          </div>
        </div>
      </div>
      <div class="flex gap-4" style="align-items: flex-start;">
        <div class="flex gap-4 min-w-0" style="flex: 6; flex-direction: column;">
          <section>
            <h2 class="text-orange font-bold mb-2" style="font-size: 14px;">/work experience</h2>
            <div class="flex flex-col gap-5">
              ${workExpHtml}
            </div>
          </section>
        </div>
        <div class="flex min-w-0 space-y-4" style="flex: 4; flex-direction: column;">
          <section>
            <h2 class="text-orange font-bold mb-2" style="font-size: 14px;">/summary</h2>
            <div class="resume-rich-text text-gray-300" style="font-size: 11px; line-height: 1.625;">
              ${formatContent(data.summary)}
            </div>
          </section>
          ${customSectionsHtml}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
