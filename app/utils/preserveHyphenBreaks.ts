/**
 * Inserts a zero-width space after hyphens in compound tokens so long
 * strings can wrap at the hyphen in narrow layouts (preview + PDF).
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
    .map((segment) => (segment.startsWith("<") ? segment : preserveHyphenBreaks(segment)))
    .join("");
}
