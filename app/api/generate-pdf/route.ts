import { NextRequest, NextResponse } from "next/server";
import { ResumeData } from "@/app/types/resume";
import { resumeToHtml } from "@/app/utils/resumeToHtml";

export const maxDuration = 60;

function formatNameForFilename(fullName: string): string {
  if (!fullName || fullName.trim() === "") return "Resume";
  const normalizedName = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  const fileName = normalizedName
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return fileName || "Resume";
}

async function launchBrowser() {
  const isVercel = !!process.env.VERCEL;
  const isLinux = process.platform === "linux";

  if (isVercel && isLinux) {
    const chromium = await import("@sparticuz/chromium");
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 794, height: 1122 },
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function POST(request: NextRequest) {
  try {
    const data: ResumeData = await request.json();
    const html = resumeToHtml(data);

    const browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await page.evaluateHandle("document.fonts.ready");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    const fileName = formatNameForFilename(data.name);
    const date = new Date();
    const dateStr = `${String(date.getDate()).padStart(2, "0")}_${String(date.getMonth() + 1).padStart(2, "0")}_${date.getFullYear()}`;
    const filename = `${fileName}_CV-${dateStr}.pdf`;

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
      { status: 500 }
    );
  }
}
