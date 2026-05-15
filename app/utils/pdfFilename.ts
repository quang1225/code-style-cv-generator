/**
 * Sanitizes the person's name for use in a downloaded PDF filename.
 * Keeps spaces between words; strips characters invalid on common filesystems.
 */
export function formatNameForPdfFilename(fullName: string): string {
  if (!fullName || fullName.trim() === "") {
    return "Resume";
  }
  const normalizedName = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  const fileName = normalizedName
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .trim();
  return fileName || "Resume";
}

/** Date portion as `DD-MM-YYYY` (e.g. `15-05-2026`). */
export function formatPdfExportDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

/** Full filename: `{Name} CV_{DD-MM-YYYY}.pdf` */
export function buildPdfFilename(fullName: string, date: Date = new Date()): string {
  return `${formatNameForPdfFilename(fullName)} CV_${formatPdfExportDate(date)}.pdf`;
}
