/**
 * Replaces non-breaking spaces (the `&nbsp;` HTML entity and the literal
 * U+00A0 character) with regular spaces so the browser can wrap text at
 * those positions.
 *
 * Quill (react-quill-new) often emits `&nbsp;` between words when the user
 * pastes content or applies certain formatting. Long runs of words connected
 * by NBSPs become a single unbreakable token, which forces `overflow-wrap:
 * break-word` to fall back to breaking words at arbitrary characters
 * (e.g. `perform` + `ance`). Normalising NBSP to a regular space restores
 * natural word wrapping in both the preview and the PDF.
 */
export function normalizeNbsp(text: string): string {
  if (text == null || text === "") {
    return text;
  }
  return text.replace(/&nbsp;|&#160;|\u00A0/g, " ");
}

/**
 * Inserts a zero-width space after hyphens in compound tokens so long
 * strings can wrap at the hyphen in narrow layouts (PDF).
 */
export function preserveHyphenBreaks(text: string): string {
  if (text == null || text === "") {
    return text;
  }
  return normalizeNbsp(text).replace(/([^\s-])-([^\s-])/g, "$1-\u200B$2");
}

/**
 * Same as {@link preserveHyphenBreaks} but only touches text between HTML tags.
 */
export function preserveHyphenBreaksInHtml(html: string): string {
  if (html == null || html === "") {
    return html;
  }
  return html
    .split(/(<[^>]+>)/g)
    .map((segment) =>
      segment.startsWith("<") ? segment : preserveHyphenBreaks(segment),
    )
    .join("");
}

/**
 * Replaces in-word hyphens with U+2011 (non-breaking hyphen, same glyph)
 * so the live preview never wraps a compound word like `Front-end`.
 *
 * The PDF intentionally keeps {@link preserveHyphenBreaks} so its narrower
 * columns can still wrap at hyphens.
 */
export function preventHyphenBreaks(text: string): string {
  if (text == null || text === "") {
    return text;
  }
  return normalizeNbsp(text).replace(/([^\s-])-([^\s-])/g, "$1\u2011$2");
}

/**
 * Same as {@link preventHyphenBreaks} but only touches text between HTML tags.
 */
export function preventHyphenBreaksInHtml(html: string): string {
  if (html == null || html === "") {
    return html;
  }
  return html
    .split(/(<[^>]+>)/g)
    .map((segment) =>
      segment.startsWith("<") ? segment : preventHyphenBreaks(segment),
    )
    .join("");
}
