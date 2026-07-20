# Resume Light/Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App `ThemeToggle` drives resume light/dark tokens so live preview and exported PDF share one palette.

**Architecture:** Shared `resumeTheme.ts` holds light/dark token maps and framework-neutral CSS-var helpers. Preview applies vars after mount + `resolvedTheme`. PDF receives nested `{ resumeData, theme }` and injects the same vars on `html`/`body` so `.pdf-bg` and `#resume-content` both resolve `var(--resume-page-bg)`.

**Tech Stack:** Next.js 16, React 19, `next-themes`, Puppeteer PDF via `/api/generate-pdf`, Vitest for pure-util unit tests.

## Global Constraints

- Single color source: `app/utils/resumeTheme.ts` — no duplicate hex tables in preview or PDF CSS.
- `ThemeToggle` remains the only user control; no resume-only toggle.
- API body is nested `{ resumeData, theme }`; theme never pollutes `ResumeData`.
- `normalizeResumeTheme`: only `"dark"` → `"dark"`; everything else → `"light"`.
- Preview: do **not** render themed resume until mounted + `resolvedTheme` available; show neutral skeleton until then.
- PDF: disable export until same readiness; never `normalizeResumeTheme(undefined)` at click time.
- PDF CSS vars declared on `html`/`body` (ancestor of both `.pdf-bg` and `#resume-content`).
- Helpers: `getResumeTheme`, `normalizeResumeTheme`, `toResumeCssVarMap`, `toResumeCssText` — no `React.CSSProperties` in `resumeTheme.ts`.
- Dark tokens stay visually close to current; light is print-friendly white/near-black with orange headers + green `<>`.

---

## File structure

| File | Responsibility |
|------|----------------|
| `app/utils/resumeTheme.ts` | Token maps + normalize + CSS var map/text helpers |
| `app/utils/resumeTheme.test.ts` | Unit tests for helpers |
| `app/utils/resumeToHtml.ts` | Theme-aware HTML/CSS for Puppeteer |
| `app/utils/resumeToHtml.theme.test.ts` | Asserts CSS vars + theme colors in HTML |
| `app/utils/pdfGenerator.ts` | Client fetch with `{ resumeData, theme }` |
| `app/api/generate-pdf/route.ts` | Destructure nested body; pass theme to `resumeToHtml` |
| `app/components/ResumePreview.tsx` | Mount gate + CSS vars; replace hardcodes |
| `app/components/HomeClient.tsx` | Theme readiness for PDF; neutral Suspense skeleton |
| `vitest.config.ts` | Vitest config (node environment) |
| `package.json` | Add `vitest` + `"test"` script |

---

### Task 1: `resumeTheme` module + Vitest

**Files:**
- Create: `app/utils/resumeTheme.ts`
- Create: `app/utils/resumeTheme.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (devDependency + script)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `export type ResumeThemeId = "light" | "dark"`
  - `export type ResumeThemeTokens = { pageBg, text, mutedText, bodyText, accentOrange, accentGreen, accentPurple, accentRed, accentBlue, accentTeal, border, copyright }`
  - `export const resumeThemes: Record<ResumeThemeId, ResumeThemeTokens>`
  - `getResumeTheme(id?: ResumeThemeId): ResumeThemeTokens`
  - `normalizeResumeTheme(value: unknown): ResumeThemeId`
  - `toResumeCssVarMap(tokens: ResumeThemeTokens): Record<string, string>`
  - `toResumeCssText(tokens: ResumeThemeTokens): string`

- [ ] **Step 1: Add Vitest**

```bash
pnpm add -D vitest
```

Add to `package.json` scripts:

```json
"test": "vitest run"
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2: Write failing tests**

Create `app/utils/resumeTheme.test.ts`:

```ts
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
    expect(map["--resume-muted-text"]).toBe("#4b5563");
    expect(map["--resume-accent-orange"]).toBe("#ea580c");
    expect(map["--resume-accent-teal"]).toBe("#0f766e");
  });

  it("toResumeCssText joins the same map (no duplicate keys)", () => {
    const map = toResumeCssVarMap(resumeThemes.dark);
    const text = toResumeCssText(resumeThemes.dark);
    for (const [key, value] of Object.entries(map)) {
      expect(text).toContain(`${key}:${value}`);
    }
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
pnpm test
```

Expected: FAIL (module missing / cannot resolve `./resumeTheme`)

- [ ] **Step 4: Implement `app/utils/resumeTheme.ts`**

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
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
pnpm test
```

Expected: all `resumeTheme` tests PASS

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts app/utils/resumeTheme.ts app/utils/resumeTheme.test.ts
git commit -m "feat: add shared resumeTheme tokens and CSS var helpers"
```

---

### Task 2: Theme-aware `resumeToHtml`

**Files:**
- Modify: `app/utils/resumeToHtml.ts`
- Create: `app/utils/resumeToHtml.theme.test.ts`

**Interfaces:**
- Consumes: `getResumeTheme`, `normalizeResumeTheme`, `toResumeCssText`, `ResumeThemeId` from `./resumeTheme`
- Produces: `resumeToHtml(data: ResumeData, theme?: ResumeThemeId | unknown): string` — second arg normalized internally

- [ ] **Step 1: Write failing tests**

Create `app/utils/resumeToHtml.theme.test.ts`:

```ts
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
});
```

Adjust `minimal` fields to match actual `ResumeData` in `app/types/resume.ts` if the type differs (read that file and include required keys only).

- [ ] **Step 2: Run tests — expect FAIL**

```bash
pnpm test app/utils/resumeToHtml.theme.test.ts
```

Expected: FAIL (signature / still hardcoded `#2d3748`)

- [ ] **Step 3: Update `resumeToHtml.ts`**

1. Import theme helpers.
2. Change signature to:

```ts
export function resumeToHtml(
  data: ResumeData,
  theme?: unknown,
): string {
  const resumeTheme = normalizeResumeTheme(theme);
  const tokens = getResumeTheme(resumeTheme);
  const cssVars = toResumeCssText(tokens);
  // ...
}
```

3. Build CSS so vars live on `html, body` and colors use vars. Replace the static color block roughly as:

```ts
const RESUME_CSS = (cssVars: string) => `
  * { /* keep existing print/font rules unchanged */ }
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
    /* keep sizing/padding/hyphen rules */
  }
  .resume-rich-text { color: var(--resume-body-text); /* keep rest */ }
  .resume-rich-text a { color: var(--resume-accent-blue); /* keep rest */ }
  .text-orange { color: var(--resume-accent-orange); }
  .text-white { color: var(--resume-text); }
  .text-gray-300 { color: var(--resume-body-text); }
  .text-gray-400 { color: var(--resume-muted-text); }
  .text-gray-600 { color: var(--resume-copyright); }
  .text-green { color: var(--resume-accent-green); }
  .text-purple { color: var(--resume-accent-purple); }
  .text-red { color: var(--resume-accent-red); }
  .text-blue { color: var(--resume-accent-blue); }
  .period-item { border-bottom: 1px solid var(--resume-border); padding-bottom: 1.25rem; }
  /* keep layout utility classes unchanged */
`;
```

4. Inline hex in the HTML template must also become vars:
   - copyright `color: #4b5563` → `color: var(--resume-copyright)`
   - avatar border `#4ade80` → `var(--resume-accent-green)`
   - avatar placeholder bg `#4b5563` → `var(--resume-border)`
   - basic-info `color: #d1d5db` → `var(--resume-body-text)`

5. Call site inside `resumeToHtml`:

```ts
<style>${RESUME_CSS(cssVars)}</style>
```

Keep layout HTML structure identical (`.pdf-bg` sibling of `#resume-content`).

- [ ] **Step 4: Run tests — expect PASS**

```bash
pnpm test
```

Expected: PASS (including theme HTML assertions). If regex for `html, body` is too strict, loosen assertion to: `html` contains `--resume-page-bg` before `.pdf-bg` and both use `var(--resume-page-bg)`.

- [ ] **Step 5: Commit**

```bash
git add app/utils/resumeToHtml.ts app/utils/resumeToHtml.theme.test.ts
git commit -m "feat: drive resumeToHtml colors from resumeTheme CSS vars"
```

---

### Task 3: Nested PDF API + client generator

**Files:**
- Modify: `app/utils/pdfGenerator.ts`
- Modify: `app/api/generate-pdf/route.ts`

**Interfaces:**
- Consumes: `ResumeThemeId`, `normalizeResumeTheme` from `resumeTheme`; `resumeToHtml(data, theme)`
- Produces:
  - `generatePDF(data: ResumeData, theme: ResumeThemeId): Promise<{ success, message }>`
  - API accepts `{ resumeData: ResumeData; theme?: unknown }`

- [ ] **Step 1: Update `pdfGenerator.ts`**

Replace body serialization:

```ts
import { ResumeData } from "../types/resume";
import { buildPdfFilename } from "./pdfFilename";
import type { ResumeThemeId } from "./resumeTheme";

export const generatePDF = async (
  data: ResumeData,
  theme: ResumeThemeId,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeData: data, theme }),
    });
    // ... rest unchanged (blob download, etc.) using data.name for filename fallback
```

- [ ] **Step 2: Update `app/api/generate-pdf/route.ts`**

Replace the start of `POST`:

```ts
import { normalizeResumeTheme } from "@/app/utils/resumeTheme";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resumeData = (body?.resumeData ?? null) as ResumeData | null;
    if (!resumeData || typeof resumeData !== "object") {
      return NextResponse.json(
        { success: false, message: "Missing resumeData in request body" },
        { status: 400 },
      );
    }
    const theme = normalizeResumeTheme(body?.theme);
    const html = resumeToHtml(resumeData, theme);
    // ... launch browser / pdf using resumeData.name for filename
```

Do **not** accept flat `{ ...ResumeData, theme }` as the primary shape. Server-side `normalizeResumeTheme` still protects garbage `theme` values.

- [ ] **Step 3: Typecheck**

```bash
pnpm exec tsc --noEmit
```

Expected: errors only in `HomeClient` / `PdfButton` still calling `generatePDF(resumeData)` with one arg — fixed in Task 5. If `tsc` is not configured standalone, run `pnpm build` and note the same call-site errors are OK until Task 5; alternatively temporarily `// @ts-expect-error` is **not** allowed — leave Task 3 compiling by updating the call signature in HomeClient in Task 5 immediately after, or include a minimal stub change:

In Task 3 only, if build must stay green, update `PdfButton` temporarily:

```ts
// temporary — Task 5 replaces with readiness-gated theme
await generatePDF(resumeData, "light");
```

Prefer finishing Task 5 in the same session before claiming green build. Task 3 commit may include only pdfGenerator + route if HomeClient still type-errors; then Task 5 must land before merge.

- [ ] **Step 4: Commit**

```bash
git add app/utils/pdfGenerator.ts app/api/generate-pdf/route.ts
git commit -m "feat: pass nested resumeData and theme to PDF API"
```

---

### Task 4: `ResumePreview` mount gate + CSS vars

**Files:**
- Modify: `app/components/ResumePreview.tsx`

**Interfaces:**
- Consumes: `useTheme` from `next-themes`; `getResumeTheme`, `normalizeResumeTheme`, `toResumeCssVarMap` from `../utils/resumeTheme`
- Produces: themed preview only when mounted + `resolvedTheme` defined

- [ ] **Step 1: Add imports + mount/theme state at top of component**

```tsx
import { useTheme } from "next-themes";
import {
  getResumeTheme,
  normalizeResumeTheme,
  toResumeCssVarMap,
} from "../utils/resumeTheme";

// inside ResumePreview:
const { resolvedTheme } = useTheme();
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

const themeReady = mounted && resolvedTheme != null;
```

- [ ] **Step 2: Neutral skeleton when not ready**

Before the main return, if `!themeReady`:

```tsx
if (!themeReady) {
  return (
    <div className="w-fit">
      <div
        className="rounded-lg animate-pulse bg-muted"
        style={{
          minHeight: "1122px",
          minWidth: "794px",
          width: "794px",
        }}
        aria-hidden
      />
    </div>
  );
}

const resumeThemeId = normalizeResumeTheme(resolvedTheme);
const cssVars = toResumeCssVarMap(getResumeTheme(resumeThemeId));
```

Use `bg-muted` (app chrome token) — **not** resume light/dark tokens — so skeleton is theme-agnostic relative to resume palettes.

- [ ] **Step 3: Apply CSS vars on `#resume-content`**

```tsx
style={{
  ...cssVars,
  fontFamily: RESUME_FONT_FAMILY_PREVIEW,
  backgroundColor: "var(--resume-page-bg)",
  color: "var(--resume-accent-teal)",
  padding: "1.5rem",
  minHeight: "1122px",
  minWidth: "794px",
  width: "794px",
  margin: "0",
  borderRadius: "8px",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
}}
```

- [ ] **Step 4: Replace hardcoded resume colors**

Map existing classes/styles to vars (keep layout classes):

| Current | Replacement |
|---------|-------------|
| `text-white` | `style={{ color: "var(--resume-text)" }}` or `className` + inline color |
| `text-green-400` / `border-green-400` | `var(--resume-accent-green)` |
| `text-orange-400` | `var(--resume-accent-orange)` |
| `text-gray-400` | `var(--resume-muted-text)` |
| `text-gray-300` / basic-info gray | `var(--resume-body-text)` |
| `text-gray-600` (copyright / line numbers) | copyright → `var(--resume-copyright)`; line numbers may use `var(--resume-border)` or `var(--resume-copyright)` |
| `bg-gray-600` avatar placeholder | `backgroundColor: "var(--resume-border)"` |
| inline `#8b5cf6` | `var(--resume-accent-purple)` |
| inline `#ef4444` | `var(--resume-accent-red)` |
| `text-blue-400` links | `var(--resume-accent-blue)` |

Prefer small inline `style={{ color: "var(--resume-...)" }}` on the colored spans so Tailwind theme classes do not fight CSS vars. Do **not** leave `#2d3748`, `#4fd1c7`, `#8b5cf6`, `#ef4444` hardcodes in this file.

Rich text: ensure `.resume-rich-text` in `globals.css` inherits color from parent or set `color: var(--resume-body-text)` on the rich-text wrappers in preview. If `globals.css` hardcodes link blues only, leave as-is **or** scope under `#resume-content` with `color: var(--resume-accent-blue)` — only if needed for parity; prefer minimal globals change (spec: TS sole color source).

- [ ] **Step 5: Manual smoke (dev)**

```bash
pnpm dev
```

- Hard-refresh with dark preference: see muted skeleton, then dark resume — never a white resume frame first.
- Toggle ThemeToggle: preview accents/bg flip.

- [ ] **Step 6: Commit**

```bash
git add app/components/ResumePreview.tsx
git commit -m "feat: theme ResumePreview from shared CSS vars with mount gate"
```

---

### Task 5: `HomeClient` theme readiness + PDF gate

**Files:**
- Modify: `app/components/HomeClient.tsx`

**Interfaces:**
- Consumes: `useTheme`, `normalizeResumeTheme`, `ResumeThemeId`, `generatePDF(data, theme)`
- Produces: PDF button disabled until `mounted && resolvedTheme != null`; passes guaranteed `ResumeThemeId`

- [ ] **Step 1: Theme readiness in `HomeClient` / `PdfButton`**

```tsx
import { useTheme } from "next-themes";
import {
  normalizeResumeTheme,
  type ResumeThemeId,
} from "../utils/resumeTheme";

function PdfButton({
  resumeData,
  theme,
  themeReady,
  isGeneratingPDF,
  onStatusChange,
  onGeneratingChange,
}: {
  resumeData: ResumeData;
  theme: ResumeThemeId | null;
  themeReady: boolean;
  isGeneratingPDF: boolean;
  onStatusChange: (status: { type: "success" | "error" | null; message: string }) => void;
  onGeneratingChange: (generating: boolean) => void;
}) {
  const handleGeneratePDF = useCallback(async () => {
    if (!themeReady || theme == null) return;
    try {
      onGeneratingChange(true);
      onStatusChange({ type: null, message: "" });
      const { generatePDF } = await import("../utils/pdfGenerator");
      const result = await generatePDF(resumeData, theme);
      // ... status handling unchanged
    } finally {
      onGeneratingChange(false);
    }
  }, [resumeData, theme, themeReady, onStatusChange, onGeneratingChange]);

  return (
    <Button
      onClick={handleGeneratePDF}
      className="w-full"
      size="lg"
      disabled={isGeneratingPDF || !themeReady || theme == null}
    >
      {/* label unchanged */}
    </Button>
  );
}
```

In `HomeClient`:

```tsx
const { resolvedTheme } = useTheme();
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

const themeReady = mounted && resolvedTheme != null;
const resumeTheme: ResumeThemeId | null = themeReady
  ? normalizeResumeTheme(resolvedTheme)
  : null;
```

Pass `theme={resumeTheme}` and `themeReady={themeReady}` into `PdfButton`.

- [ ] **Step 2: Neutral Suspense fallback**

Replace:

```tsx
<div className="w-[794px] min-h-[400px] bg-[#2d3748] rounded-lg animate-pulse" />
```

with:

```tsx
<div className="w-[794px] min-h-[400px] bg-muted rounded-lg animate-pulse" />
```

- [ ] **Step 3: Verify build**

```bash
pnpm test
pnpm exec tsc --noEmit
```

Expected: tests PASS; no type errors on `generatePDF` arity.

- [ ] **Step 4: Manual export gate check**

- Hard-refresh dark: PDF button disabled until preview themed; first export opens dark PDF matching preview.
- Switch to light; export; PDF white/`#111827` text.

- [ ] **Step 5: Commit**

```bash
git add app/components/HomeClient.tsx
git commit -m "feat: gate PDF export until resume theme is resolved"
```

---

### Task 6: Final verification + optional globals cleanup

**Files:**
- Modify only if needed: `app/globals.css` (preview rich-text / link colors under `#resume-content`)

**Interfaces:** none new

- [ ] **Step 1: Grep for leftover hardcodes in resume paths**

```bash
rg "#2d3748|#4fd1c7|#8b5cf6|#ef4444|#fb923c|#4ade80" app/components/ResumePreview.tsx app/utils/resumeToHtml.ts app/components/HomeClient.tsx
```

Expected: no matches (or only comments). Accents must come from vars/tokens.

- [ ] **Step 2: Full checklist**

- [ ] Toggle light ↔ dark updates preview
- [ ] Dark PDF ≈ dark preview; light PDF ≈ light preview
- [ ] Hard-refresh dark: skeleton → dark (no light resume flash)
- [ ] PDF disabled until ready; first dark export correct
- [ ] `pnpm test` green
- [ ] `pnpm build` succeeds

- [ ] **Step 3: Commit only if globals changed**

```bash
git add app/globals.css
git commit -m "fix: align resume rich-text colors with CSS vars"
```

If no globals change, skip commit.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Shared token maps + hex values | Task 1 |
| `getResumeTheme` / `normalizeResumeTheme` / `toResumeCssVarMap` / `toResumeCssText` | Task 1 |
| No React types in `resumeTheme.ts` | Task 1 |
| PDF vars on html/body; `.pdf-bg` uses `var(--resume-page-bg)` | Task 2 |
| Nested `{ resumeData, theme }` | Task 3 |
| Preview mount gate + neutral skeleton | Task 4 |
| Replace preview hardcodes with vars | Task 4 |
| PDF disabled until theme ready | Task 5 |
| Neutral HomeClient Suspense skeleton | Task 5 |
| Dark≈current, light print-friendly | Tasks 1–2 (tokens) + 4 (wiring) |

No remaining TBD placeholders. Types consistent: `ResumeThemeId`, nested body, `generatePDF(data, theme)`.
