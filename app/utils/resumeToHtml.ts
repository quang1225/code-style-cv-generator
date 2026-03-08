import { ResumeData } from "../types/resume";

const RESUME_CSS = `
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { margin: 0; padding: 0; font-family: 'Roboto Mono', monospace; background-color: #2d3748 !important; min-height: 100vh; }
  @page { size: A4; margin: 0; }
  .pdf-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: #2d3748; z-index: -1; }
  #resume-content {
    background-color: #2d3748;
    color: #4fd1c7;
    padding: 1.5rem;
    min-height: 1122px;
    min-width: 794px;
    width: 794px;
    font-size: 12px;
  }
  .resume-rich-text { font-size: 11px; line-height: 1.625; color: #d1d5db; }
  .resume-rich-text strong { font-weight: bold; }
  .resume-rich-text em { font-style: italic; }
  .resume-rich-text p { margin: 0; padding: 0; }
  .resume-rich-text p:not(:first-child) { margin-top: 0.25rem; }
  .resume-rich-text br { display: block; margin: 0.125rem 0; }
  .resume-rich-text a { color: #3b82f6; text-decoration: underline; text-decoration-thickness: 1px; }
  .copyright-link { color: inherit !important; text-decoration: underline; text-decoration-thickness: 1px; }
  .resume-rich-text .ql-indent-1 { padding-left: 2em; }
  .resume-rich-text .ql-indent-2 { padding-left: 4em; }
  .resume-rich-text .ql-indent-3 { padding-left: 6em; }
  .resume-rich-text .ql-indent-4 { padding-left: 8em; }
  .resume-rich-text .ql-indent-5 { padding-left: 10em; }
  .text-orange { color: #fb923c; }
  .text-white { color: #ffffff; }
  .text-gray-300 { color: #d1d5db; }
  .text-gray-400 { color: #9ca3af; }
  .text-gray-600 { color: #4b5563; }
  .text-green { color: #4ade80; }
  .text-purple { color: #8b5cf6; }
  .text-red { color: #ef4444; }
  .text-blue { color: #3b82f6; }
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
  .title-period-row { display: flex; flex-wrap: nowrap; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
  .title-period-row .title { flex: 1; min-width: 0; font-weight: 600; font-size: 12px; }
  .title-period-row .period { flex-shrink: 0; white-space: nowrap; font-weight: bold; font-size: 12px; }
  .period-item { border-bottom: 1px solid #4b5563; padding-bottom: 1.25rem; }
  .period-item:last-child { border-bottom: none; padding-bottom: 0; }
`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeHtml(html: string): string {
  return html.replace(/&nbsp;/g, " ").replace(/&#160;/g, " ");
}

function formatContent(text: string): string {
  if (!text || typeof text !== "string") return "";
  if (text.includes("<")) {
    return normalizeHtml(text);
  }
  return escapeHtml(text).replace(/\n/g, "<br>");
}

export function resumeToHtml(data: ResumeData): string {
  const workExpHtml = (data.workExperience ?? [])
    .map(
      (job, index) => `
      <div class="${index < (data.workExperience?.length ?? 1) - 1 ? "period-item" : ""}">
        <div class="mb-1">
          <div class="title-period-row mb-0.5">
            <span class="title text-white">${escapeHtml(job.position)}</span>
            <span class="period text-purple">${escapeHtml(job.period)}</span>
          </div>
          <p class="text-gray-400" style="font-size: 12px;">
            <span class="text-red font-semibold">🏢 ${escapeHtml(job.company)}</span>
          </p>
        </div>
        <div class="resume-rich-text text-gray-300" style="font-size: 11px; line-height: 1.625;">
          ${formatContent(job.description)}
        </div>
      </div>
    `
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
          `
            )
            .join("")}
        </div>
      </section>
    `
    )
    .join("");

  const basicInfoHtml = [
    data.yearOfBirth && `🎂 Year of Birth: ${escapeHtml(data.yearOfBirth)}`,
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>${RESUME_CSS}</style>
</head>
<body>
  <div class="pdf-bg" aria-hidden="true"></div>
  <div id="resume-content">
    ${data.showCopyright ? `
    <div style="position: absolute; top: 0.5rem; left: 50%; transform: translateX(-50%); font-size: 10px; color: #4b5563; z-index: 10;">
      CV made with <a href="https://code-style-cv-generator.quang.work" class="copyright-link" target="_blank" rel="noopener">https://code-style-cv-generator.quang.work</a>
    </div>
    ` : ""}
    <div>
      <div class="mb-5">
        <div class="flex gap-4 mb-3" style="flex-wrap: wrap; align-items: center;">
          <div class="shrink-0">
            ${data.avatar ? `<img src="${data.avatar}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #4ade80;">` : `<div style="width: 80px; height: 80px; border-radius: 50%; background: #4b5563; border: 2px solid #4ade80;"></div>`}
          </div>
          <div class="flex-1">
            <div class="mb-1" style="font-size: 24px; font-weight: bold;">
              <span class="text-green">&lt;</span><span class="text-white">CV</span><span class="text-green">&gt;</span>
            </div>
            <div class="text-white font-bold" style="font-size: 20px;">${escapeHtml(data.name)}</div>
            <div class="text-gray-400" style="font-size: 12px;">${escapeHtml(data.title)}</div>
          </div>
          <div style="font-size: 11px; color: #d1d5db; display: flex; flex-direction: column; gap: 0.125rem;">
            ${basicInfoHtml}
          </div>
        </div>
      </div>
      <div class="flex gap-4" style="align-items: flex-start;">
        <div class="flex gap-4 min-w-0" style="flex: 6; flex-direction: column;">
          <section>
            <h2 class="text-orange font-bold mb-2" style="font-size: 14px;">/summary</h2>
            <div class="resume-rich-text text-gray-300" style="font-size: 11px; line-height: 1.625;">
              ${formatContent(data.summary)}
            </div>
          </section>
          <section>
            <h2 class="text-orange font-bold mb-2" style="font-size: 14px;">/work experience</h2>
            <div class="flex flex-col gap-5">
              ${workExpHtml}
            </div>
          </section>
        </div>
        <div class="flex min-w-0 space-y-4" style="flex: 4; flex-direction: column;">
          ${customSectionsHtml}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
