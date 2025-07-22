import { toPng } from "html-to-image";
import jsPDF from "jspdf";

// Function to convert full name to filename format
const formatNameForFilename = (fullName: string): string => {
  if (!fullName || fullName.trim() === "") {
    return "Resume"; // fallback name
  }

  // Remove diacritics (accented characters) and convert to ASCII
  const normalizedName = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

  // Replace spaces with underscores and remove special characters
  const fileName = normalizedName
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return fileName || "Resume"; // fallback if nothing remains
};

export const generatePDF = async (
  fullName: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  const element = document.getElementById("resume-content");
  if (!element) {
    throw new Error("Resume content not found");
  }

  try {
    // Wait for fonts and images to load
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Ensure fonts are loaded (with timeout for performance)
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
    } catch (e) {
      console.log("Font loading timeout, proceeding with PDF generation");
    }

    console.log("Starting PDF generation with html-to-image...", {
      elementWidth: element.offsetWidth,
      elementHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
    });

    // Configure html-to-image options for balanced quality and performance
    const options = {
      quality: 1,
      pixelRatio: 2, // Balanced setting for good quality and performance
      width: element.offsetWidth,
      height: element.offsetHeight,
      cacheBust: true,
    };

    // Generate PNG using html-to-image
    console.log("Generating image with html-to-image...");
    const dataUrl = await toPng(element, options);

    console.log("Image generated successfully", {
      dataUrlLength: dataUrl.length,
      dataUrlPrefix: dataUrl.substring(0, 50),
    });

    // Check if we have actual image data
    if (!dataUrl || dataUrl === "data:image/png;base64,") {
      throw new Error("Image generation failed - no data");
    }

    // Create PDF with proper A4 dimensions and balanced settings
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      compress: true, // Enable compression for better performance
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Create a temporary image to get dimensions
    const img = new Image();

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    const imgWidth = img.width;
    const imgHeight = img.height;

    // Calculate scale to fit A4 width
    const scale = pdfWidth / imgWidth;
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    console.log("PDF dimensions:", {
      pdfWidth,
      pdfHeight,
      imgWidth,
      imgHeight,
      scale,
      scaledWidth,
      scaledHeight,
    });

    // Check if content fits on one page
    if (scaledHeight <= pdfHeight) {
      // Content fits on one page - center it
      const y = Math.max(0, (pdfHeight - scaledHeight) / 2);
      pdf.addImage(dataUrl, "PNG", 0, y, scaledWidth, scaledHeight);
    } else {
      // Content needs multiple pages
      const pageHeight = pdfHeight;
      const totalPages = Math.ceil(scaledHeight / pageHeight);

      console.log(`Content requires ${totalPages} pages`);

      // Create a canvas for splitting the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not create canvas context");
      }

      // Calculate how much original image height fits in one PDF page
      const originalHeightPerPage = imgHeight / (scaledHeight / pageHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the source rectangle for this page
        const sourceY = page * originalHeightPerPage;
        const isLastPage = page === totalPages - 1;

        // Calculate source height - ensure we don't exceed image bounds
        const sourceHeight = Math.min(
          originalHeightPerPage,
          imgHeight - sourceY
        );

        // Skip if this would be a blank page
        if (sourceHeight <= 10) {
          console.log(`Skipping page ${page + 1} - too little content`);
          continue;
        }

        // Always use consistent canvas height to prevent distortion
        const canvasHeight = Math.ceil(originalHeightPerPage);
        canvas.width = imgWidth;
        canvas.height = canvasHeight;

        // Configure canvas for balanced text rendering
        ctx.imageSmoothingEnabled = true; // Enable smoothing for better performance
        ctx.imageSmoothingQuality = "medium";

        // Fill entire canvas with background color
        ctx.fillStyle = "#2d3748";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the portion of the original image for this page
        // Keep the same proportions - no stretching
        ctx.drawImage(
          img,
          0, // source x
          sourceY, // source y
          imgWidth, // source width
          sourceHeight, // source height
          0, // destination x
          0, // destination y
          imgWidth, // destination width
          sourceHeight // destination height (maintain aspect ratio)
        );

        // Convert this page to image data with maximum quality
        const pageImgData = canvas.toDataURL("image/png", 1.0);

        console.log(`Page ${page + 1}:`, {
          sourceY: sourceY.toFixed(2),
          sourceHeight: sourceHeight.toFixed(2),
          canvasHeight: canvasHeight,
          isLastPage,
        });

        // Always use full page height for consistent PDF layout
        pdf.addImage(pageImgData, "PNG", 0, 0, scaledWidth, pageHeight);
      }
    }

    // Save the PDF with date
    const fileName = formatNameForFilename(fullName);
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const dateStr = `${day}_${month}_${year}`;

    pdf.save(`${fileName}_CV-${dateStr}.pdf`);

    return { success: true, message: "PDF generated successfully!" };
  } catch (error) {
    console.error("Error generating PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      message: `Error generating PDF: ${errorMessage}. Please try again.`,
    };
  }
};
