/**
 * Inserts a zero-width space after hyphens in compound tokens so long
 * strings can wrap at the hyphen in narrow layouts (PDF).
 */
export function preserveHyphenBreaks(text: string): string {
  if (text == null || text === "") {
    return text;
  }
  return text.replace(/([^\s-])-([^\s-])/g, "$1-\u200B$2");
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
  return text.replace(/([^\s-])-([^\s-])/g, "$1\u2011$2");
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
