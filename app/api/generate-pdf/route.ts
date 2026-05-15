import { NextRequest, NextResponse } from "next/server";
import { ResumeData } from "@/app/types/resume";
import { buildPdfFilename } from "@/app/utils/pdfFilename";
import { resumeToHtml } from "@/app/utils/resumeToHtml";

export const maxDuration = 60;

/**
 * A4 at 96 CSS pixels/inch. `deviceScaleFactor: 2` upscales raster content
 * (color emoji glyph atlases, the avatar bitmap) so they stay crisp in the
 * PDF; vector text is unaffected by this and stays vector.
 */
const PDF_VIEWPORT = {
  width: 794,
  height: 1122,
  deviceScaleFactor: 2,
} as const;

async function launchBrowser() {
  const isVercel = !!process.env.VERCEL;
  const isLinux = process.platform === "linux";

  if (isVercel && isLinux) {
    const chromium = await import("@sparticuz/chromium");
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: PDF_VIEWPORT,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.default.launch({
    headless: true,
    defaultViewport: PDF_VIEWPORT,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--font-render-hinting=none",
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const data: ResumeData = await request.json();
    const html = resumeToHtml(data);

    const browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setViewport(PDF_VIEWPORT);
    await page.setContent(html, {
      waitUntil: "load",
      timeout: 30000,
    });

    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images, (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
              }),
        ),
      );
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
      tagged: true,
    });

    await browser.close();

    const filename = buildPdfFilename(data.name);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error generating PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}
