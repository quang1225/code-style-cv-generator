# Resume light/dark theme (preview + PDF)

**Date:** 2026-07-21  
**Status:** Approved design

## Goal

App `ThemeToggle` drives resume appearance. Live preview and exported PDF use the same palette for the resolved `light` | `dark` theme.

## Non-goals

- Extra resume-only theme toggle
- App chrome / shadcn token redesign
- Passing `"system"` (or any non-resume theme string) across the PDF API boundary
- Second resume template / layout redesign

## Architecture

```
ThemeToggle (next-themes)
        │
        ▼
 resolvedTheme ──► ResumePreview (CSS vars from resumeTheme.ts)
        │
        ▼
 normalizeResumeTheme ──► POST { resumeData, theme } ──► API ──► resumeToHtml(data, theme)
                                                              │
                                                              └── same var map → :root/html/body CSS in Puppeteer HTML
```

- Single source of color: `app/utils/resumeTheme.ts`
- Preview and PDF consume the same semantic tokens
- `ThemeToggle` remains the only user control
- PDF request body is **nested** `{ resumeData, theme }` — theme never pollutes `ResumeData`

## Token model

```ts
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
    pageBg: "#ffffff",
    text: "#111827",
    mutedText: "#4b5563",
    bodyText: "#374151",
    accentOrange: "#ea580c",
    accentGreen: "#16a34a",
    accentPurple: "#7c3aed",
    accentRed: "#dc2626",
    accentBlue: "#2563eb",
    accentTeal: "#0f766e",
    border: "#e5e7eb",
    copyright: "#9ca3af",
  },
} satisfies Record<ResumeThemeId, ResumeThemeTokens>;
```

### Light vs dark intent

- **Dark:** keep current code-style mood; refactor onto shared token roles (no visual redesign).
- **Light:** print-friendly CV — white page, near-black text, restrained accents; preserve code identity via orange section headers and green `<>` tags. Use `accentTeal` sparingly (same semantic surface as dark, no special-casing).

### CSS variable naming

Map tokens to kebab vars, e.g. `--resume-page-bg`, `--resume-text`, `--resume-muted-text`, … produced by one shared map helper so preview and PDF never diverge.

**PDF placement:** declare vars on `html` / `body` (or a shared wrapper that ancestors both). `.pdf-bg` is a **sibling** of `#resume-content` today — vars only on `#resume-content` do **not** cascade to `.pdf-bg`. Both `.pdf-bg` and `#resume-content` consume `var(--resume-page-bg)` (and related) from the ancestor declaration.

## Helpers (explicit names)

Framework-neutral in `resumeTheme.ts` (safe for server PDF path — no React runtime types):

```ts
getResumeTheme(id?: ResumeThemeId): ResumeThemeTokens
normalizeResumeTheme(value: unknown): ResumeThemeId
toResumeCssVarMap(tokens: ResumeThemeTokens): Record<string, string>
// e.g. { "--resume-page-bg": "#ffffff", "--resume-text": "#111827", ... }

toResumeCssText(tokens: ResumeThemeTokens): string
// e.g. "--resume-page-bg:#ffffff;--resume-text:#111827;..." for inline style / CSS block
```

- `normalizeResumeTheme`: only `"dark"` → `"dark"`; everything else → `"light"`.
- Preview may wrap `toResumeCssVarMap` into `style={...}` at the component boundary; PDF uses `toResumeCssText` (or the same map joined into a CSS rule). **One** token→var mapping; no duplicate color tables.

## Preview behavior

1. `ResumePreview` reads `resolvedTheme` from `next-themes`.
2. **Mount gate:** do **not** render the themed resume until mounted and `resolvedTheme` is available. Until then, render a **neutral skeleton** (theme-agnostic placeholder — no light-token resume). This avoids hydration mismatch **and** a light→dark flash when the saved preference is dark / system-dark.
3. After mount: apply CSS vars from `toResumeCssVarMap(getResumeTheme(normalizeResumeTheme(resolvedTheme)))` on the resume root; replace hardcoded hex / theme-colored Tailwind with `var(--resume-*)`.
4. Lazy-load / Suspense skeleton in `HomeClient` stays neutral (or matches post-mount theme only after resolved) — never paint a wrong themed plate before mount.

## PDF export behavior

1. **Theme readiness gate (preview/PDF parity):** do not allow export until the same readiness used by preview — mounted + `resolvedTheme` available. Prefer either:
   - disable `PdfButton` until ready, **or**
   - `HomeClient` only passes a guaranteed `ResumeThemeId` into `PdfButton` / `generatePDF` after readiness (button stays disabled while `theme` is unset).
   
   Do **not** call `normalizeResumeTheme(resolvedTheme)` while `resolvedTheme` is still undefined — that would coerce to `"light"` and can mismatch a dark preview once it mounts.
2. When ready: `const resumeTheme = normalizeResumeTheme(resolvedTheme)` (now a real `"light"` | `"dark"` from next-themes).
3. `generatePDF` POSTs nested body:

   ```ts
   { resumeData: ResumeData; theme: ResumeThemeId }
   ```

4. `POST /api/generate-pdf` destructures `{ resumeData, theme }`, runs `normalizeResumeTheme(theme)`, then `resumeToHtml(resumeData, resumeTheme)`.
5. `resumeToHtml` sets CSS variables on `html`/`body` via `toResumeCssText` (same map as preview). `.pdf-bg` and `#resume-content` both use `var(--resume-page-bg)` etc.

## Files to change

| File | Change |
|------|--------|
| `app/utils/resumeTheme.ts` | **New** — tokens + helpers |
| `app/components/ResumePreview.tsx` | Mount gate; CSS vars; remove hardcodes |
| `app/utils/resumeToHtml.ts` | Accept theme; var-driven CSS |
| `app/utils/pdfGenerator.ts` | POST `{ resumeData, theme }` |
| `app/components/HomeClient.tsx` | Theme readiness → pass `ResumeThemeId` / disable PDF until ready; neutral pre-mount skeleton |
| `app/api/generate-pdf/route.ts` | Destructure `{ resumeData, theme }`; normalize; pass to `resumeToHtml` |
| `app/globals.css` | Only if shared `.resume-root` defaults needed; prefer TS as sole color source |

## Success criteria

- Toggling app theme updates preview palette immediately (after mount).
- Generated PDF matches the preview theme for that export.
- No hydration mismatch on preview.
- No themed light→dark (or dark→light) flash: themed resume renders only after mount + resolved theme; pre-mount shows neutral skeleton only.
- Dark remains visually close to today’s resume.
- Light reads as a professional print CV, not a washed-out inversion of the app UI.
- API request is `{ resumeData, theme }`; theme is always normalized to `"light"` | `"dark"` before `resumeToHtml`.
- Generate PDF disabled (or otherwise unreachable) until theme readiness; no export that could coerce undefined → `"light"` while preview will paint dark.

## Testing notes

- Manual: toggle light ↔ dark; confirm preview; export both; open PDFs side-by-side with preview.
- Hydration / flash: hard-refresh with saved dark (and system-dark); expect neutral skeleton then correct dark — never a painted light resume frame.
- Export gate: hard-refresh dark preference; PDF button disabled until preview themed; first enabled export matches dark preview.
- API: POST with missing/`system`/`garbage` theme → treated as `light`; confirm nested `{ resumeData, theme }` shape (reject or ignore flat `theme` on resume fields).
- PDF bg: light export has white `.pdf-bg` and content plate; dark export keeps `#2d3748` on both.
