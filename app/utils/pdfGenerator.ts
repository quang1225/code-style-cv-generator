import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Helper function to convert oklch/unsupported colors to hex
const convertColorToHex = (color: string): string => {
  // Handle common color formats first
  if (color.includes("#")) {
    return color; // Already hex
  }

  // Handle rgb colors
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  // Handle rgba colors
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  // Try to convert using DOM (for hsl, oklch, etc.)
  try {
    const tempDiv = document.createElement("div");
    tempDiv.style.color = color;
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    // Try to convert the computed color
    const computedRgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (computedRgbMatch) {
      const r = parseInt(computedRgbMatch[1]);
      const g = parseInt(computedRgbMatch[2]);
      const b = parseInt(computedRgbMatch[3]);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  } catch (error) {
    console.warn("Failed to convert color:", color, error);
  }

  // Fallback to black for unknown colors
  return "#000000";
};

// Define explicit color mappings for all CSS classes
const colorMappings = {
  "text-green-400": "#4ade80",
  "text-white": "#ffffff",
  "text-gray-400": "#9ca3af",
  "text-gray-300": "#d1d5db",
  "text-gray-600": "#6b7280",
  "text-orange-400": "#fb923c",
  "text-blue-400": "#3b82f6",
  "text-blue-300": "#93c5fd",
  "text-red-500": "#ef4444",
  "text-green-500": "#10b981",
  "text-yellow-500": "#f59e0b",
  "text-purple-500": "#8b5cf6",
  "bg-gray-600": "#4b5563",
  "border-green-400": "#4ade80",
  "bg-resume-bg": "#2d3748",
  "text-resume-text": "#4fd1c7",
};

export const generatePDF = async (): Promise<{ success: boolean; message: string }> => {
  const element = document.getElementById("resume-content");
  if (!element) {
    throw new Error("Resume content not found");
  }

  try {
    // Wait for fonts and images to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Starting PDF generation...", {
      elementWidth: element.offsetWidth,
      elementHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      captureHeight: Math.max(element.offsetHeight, element.scrollHeight) + 20,
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#2d3748",
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      logging: false,
      width: element.offsetWidth,
      height: element.scrollHeight, // Use actual scroll height without buffer
      windowWidth: element.offsetWidth,
      windowHeight: element.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById("resume-content");
        if (clonedElement) {
          // Create a safe CSS replacement that avoids oklch/hsl color functions
          const head = clonedDoc.querySelector("head");
          if (head) {
            head.innerHTML = `
              <style>
                /* 
                ⚠️  CRITICAL: PDF-PREVIEW UI CONSISTENCY MAINTENANCE
                
                This CSS MUST be kept in perfect sync with the ResumePreview component.
                The Preview and Generated PDF must be visually identical.
                
                🔄 SYNC REQUIREMENTS:
                1. Every Tailwind class in ResumePreview.tsx MUST be mapped here
                2. Use exact hex colors (#ffffff) - NO CSS variables or hsl/oklch
                3. Use exact rem/px units - NO CSS variables
                4. Copy positioning classes exactly (top-2, right-2, left-2, etc.)
                5. Match all spacing, typography, and layout classes
                
                📋 TESTING CHECKLIST:
                ✅ Preview matches exactly with PDF output
                ✅ Copyright text positioning (currently top-right)
                ✅ All colors render identically
                ✅ Typography and spacing are consistent
                ✅ Mobile scaling doesn't break PDF generation
                
                🚨 BREAKING CHANGES PROTOCOL:
                - Any change to ResumePreview.tsx requires updating this CSS
                - Test both preview and PDF after ANY styling change
                - Pay special attention to positioning classes
                - Verify mobile responsive changes don't affect PDF
                
                💡 COMMON CLASSES TO SYNC:
                - Positioning: absolute, relative, top-*, right-*, left-*, bottom-*
                - Colors: text-*, bg-*, border-*
                - Typography: font-*, text-*, leading-*
                - Spacing: p-*, m-*, gap-*, space-*
                - Layout: flex, grid, w-*, h-*
                */
                
                /* Reset to avoid conflicts */
                * { box-sizing: border-box; }
                
                /* Resume container */
                #resume-content {
                  background-color: #2d3748 !important;
                  color: #4fd1c7 !important;
                  font-family: Monaco, Menlo, monospace !important;
                  font-size: 14px !important;
                  line-height: 1.5 !important;
                  width: 794px !important;
                  min-height: 1122px !important;
                  padding: 32px 0 !important;
                  margin: 0 !important;
                }
                
                /* Layout styles */
                .flex { display: flex !important; }
                .flex-1 { flex: 1 !important; }
                .gap-6 { gap: 1.5rem !important; }
                .gap-4 { gap: 1rem !important; }
                .gap-3 { gap: 0.75rem !important; }
                .gap-8 { gap: 2rem !important; }
                .gap-2 { gap: 0.5rem !important; }
                .gap-1 { gap: 0.25rem !important; }
                .items-center { align-items: center !important; }
                .items-start { align-items: flex-start !important; }
                .justify-center { justify-content: center !important; }
                .justify-between { justify-content: space-between !important; }
                .space-y-6 > * + * { margin-top: 1.5rem !important; }
                .space-y-4 > * + * { margin-top: 1rem !important; }
                .space-y-1 > * + * { margin-top: 0.25rem !important; }
                .mx-2 { margin-left: 0.5rem !important; margin-right: 0.5rem !important; }
                .mb-8 { margin-bottom: 2rem !important; }
                .mb-4 { margin-bottom: 1rem !important; }
                .mb-3 { margin-bottom: 0.75rem !important; }
                .mb-2 { margin-bottom: 0.5rem !important; }
                .mb-1 { margin-bottom: 0.25rem !important; }
                .shrink-0 { flex-shrink: 0 !important; }
                .min-w-0 { min-width: 0 !important; }
                .text-right { text-align: right !important; }
                .text-left { text-align: left !important; }
                .leading-relaxed { line-height: 1.625 !important; }
                .relative { position: relative !important; }
                .absolute { position: absolute !important; }
                .top-2 { top: 0.5rem !important; }
                .left-2 { left: 0.5rem !important; }
                .right-2 { right: 0.5rem !important; }
                .whitespace-nowrap { white-space: nowrap !important; }
                .z-10 { z-index: 10 !important; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
                
                /* Typography */
                .text-3xl { font-size: 1.875rem !important; }
                .text-2xl { font-size: 1.5rem !important; }
                .text-base { font-size: 1rem !important; }
                .text-sm { font-size: 0.875rem !important; }
                .text-xs { font-size: 0.75rem !important; }
                .text-\\[10px\\] { font-size: 10px !important; }
                .font-bold { font-weight: 700 !important; }
                .font-semibold { font-weight: 600 !important; }
                .font-normal { font-weight: 400 !important; }
                .font-mono { font-family: Monaco, Menlo, monospace !important; }
                
                /* Colors - using safe hex values */
                .text-white { color: #ffffff !important; }
                .text-green-400 { color: #4ade80 !important; }
                .text-orange-400 { color: #fb923c !important; }
                .text-blue-400 { color: #3b82f6 !important; }
                .text-blue-300 { color: #93c5fd !important; }
                .text-gray-400 { color: #9ca3af !important; }
                .text-gray-300 { color: #d1d5db !important; }
                .text-gray-600 { color: #6b7280 !important; }
                .text-gray-500 { color: #6b7280 !important; }
                .bg-gray-600 { background-color: #4b5563 !important; }
                .border-2 { border-width: 2px !important; border-style: solid !important; }
                .border-green-400 { border-color: #4ade80 !important; }
                .rounded-full { border-radius: 9999px !important; }
                
                /* Dimensions */
                .w-16 { width: 4rem !important; }
                .h-16 { height: 4rem !important; }
                .w-20 { width: 5rem !important; }
                .h-20 { height: 5rem !important; }
                .w-24 { width: 6rem !important; }
                .h-24 { height: 6rem !important; }
                .w-3 { width: 0.75rem !important; }
                .h-3 { height: 0.75rem !important; }
                
                /* Text decoration */
                .underline { text-decoration: underline !important; }
                
                /* Hover states (approximated for PDF since hover doesn't apply) */
                a:hover { color: #93c5fd !important; }
                .hover\\:text-blue-300:hover { color: #93c5fd !important; }
                .hover\\:text-gray-500:hover { color: #6b7280 !important; }
                
                /* Since PDFs don't support hover, we'll use the base colors */
                .hover\\:text-blue-300 { color: #3b82f6 !important; }
                .hover\\:text-gray-500 { color: #6b7280 !important; }
                
                /* Specific class for preventing period breaks - only for period text */
                .prevent-period-break {
                  display: inline-block !important;
                  word-break: keep-all !important;
                  overflow-wrap: normal !important;
                  hyphens: none !important;
                  white-space: nowrap !important;
                  text-wrap: nowrap !important;
                  flex-shrink: 0 !important;
                }
                
                .resume-rich-text {
                  text-wrap: pretty !important;
                  hyphens: auto !important;
                  word-break: normal !important;
                  overflow-wrap: break-word !important;
                }
                
                /* Remove any problematic CSS custom properties */
                * { 
                  font-family: Monaco, Menlo, monospace !important;
                }
                
                /* General resume text formatting */
                #resume-content {
                  text-wrap: pretty !important;
                  hyphens: auto !important;
                }
              </style>
            `;
          }

          // Remove only external stylesheets, keep our safe CSS
          const externalStylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          externalStylesheets.forEach((sheet) => sheet.remove());

          // Clean up any remaining style attributes that might contain unsupported color functions
          const allElements = clonedElement.querySelectorAll("*");
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;

            try {
              // Only remove style attributes that might contain problematic color functions
              if (htmlEl.style.cssText) {
                const styleText = htmlEl.style.cssText;
                if (styleText.includes("oklch") || styleText.includes("hsl(") || styleText.includes("var(--")) {
                  htmlEl.removeAttribute("style");
                }
              }

              // Ensure font family is applied
              if (!htmlEl.style.fontFamily) {
                htmlEl.style.fontFamily = "Monaco, Menlo, monospace";
              }
            } catch (error) {
              console.warn("Error processing element:", error);
            }
          });

          // Ensure the root element has the correct background
          clonedElement.style.backgroundColor = "#2d3748";
          clonedElement.style.color = "#4fd1c7";
          clonedElement.style.fontFamily = "Monaco, Menlo, monospace";
        }
      },
    });

    console.log("Canvas generated:", {
      width: canvas.width,
      height: canvas.height,
      dataURL: canvas.toDataURL("image/png").substring(0, 100) + "...",
    });

    // Check if canvas is actually populated
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("Canvas is empty");
    }

    const imgData = canvas.toDataURL("image/png");

    // Check if we have actual image data
    if (imgData === "data:image/png;base64,") {
      throw new Error("Canvas data is empty");
    }

    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate scale to fit A4 full width
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
      // Content fits on one page
      const y = Math.max(0, (pdfHeight - scaledHeight) / 2);
      pdf.addImage(imgData, "PNG", 0, y, scaledWidth, scaledHeight);
    } else {
      // Content needs multiple pages - use full page height, no white space
      const pageHeight = pdfHeight;
      const totalPages = Math.ceil(scaledHeight / pageHeight);

      console.log(`Content requires ${totalPages} pages`);

      // Create a temporary canvas for each page
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) {
        throw new Error("Could not create temporary canvas context");
      }

      // Use a simpler, more reliable approach
      // Calculate how much original canvas height fits in one PDF page
      const originalHeightPerPage = canvas.height / (scaledHeight / pageHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the source rectangle for this page
        const sourceY = page * originalHeightPerPage;
        const isLastPage = page === totalPages - 1;

        // For the last page, always take everything remaining to avoid missing content
        const sourceHeight = isLastPage
          ? canvas.height - sourceY // Take all remaining content
          : originalHeightPerPage;

        // Skip if this would be a blank or nearly blank page
        if (sourceHeight <= 50) {
          console.log(`Skipping page ${page + 1} - too little content (${sourceHeight}px)`);
          continue;
        }

        // Set canvas size for full page height to maintain consistent background
        tempCanvas.width = canvas.width;
        tempCanvas.height = Math.ceil(originalHeightPerPage);

        // Fill with background color first
        tempCtx.fillStyle = "#2d3748";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the portion of the original canvas for this page
        tempCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight, // source rectangle
          0,
          0,
          tempCanvas.width,
          sourceHeight // destination rectangle
        );

        // Convert this page to image data
        const pageImgData = tempCanvas.toDataURL("image/png");

        // Always use full page height for consistent appearance
        const pageScaledHeight = pageHeight;

        // Add this page to the PDF, filling the full page height
        pdf.addImage(pageImgData, "PNG", 0, 0, scaledWidth, pageScaledHeight);

        console.log(
          `Added page ${page + 1}/${totalPages}, sourceHeight: ${sourceHeight.toFixed(
            1
          )}px, scaledHeight: ${pageScaledHeight.toFixed(1)}pt`
        );
      }
    }

    pdf.save("alexandra-morgan-resume.pdf");

    console.log("PDF generated successfully");
    return { success: true, message: "PDF generated successfully!" };
  } catch (error) {
    console.error("Error generating PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.log(`Error generating PDF: ${errorMessage}. Please try again.`);

    return { success: false, message: `Error generating PDF: ${errorMessage}. Please try again.` };
  }
};
