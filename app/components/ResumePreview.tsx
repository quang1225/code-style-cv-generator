"use client";

import React, { useRef, useEffect, useState } from "react";
import { ResumeData } from "../types/resume";

interface ResumePreviewProps {
  data: ResumeData;
}

/*
⚠️  IMPORTANT: PDF LAYOUT CONSISTENCY

The PDF is generated via /api/generate-pdf using utils/resumeToHtml.ts.
When changing layout or styles here, update resumeToHtml.ts to match
so the exported PDF stays consistent with the preview.
*/

const ResumePreview: React.FC<ResumePreviewProps> = React.memo(({ data }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(60); // Start with a reasonable default

  useEffect(() => {
    const updateLineCount = () => {
      if (contentRef.current && lineNumbersRef.current) {
        // Wait for next frame to ensure DOM is updated
        requestAnimationFrame(() => {
          if (contentRef.current && lineNumbersRef.current) {
            // Get the actual rendered height of the content
            const contentHeight = contentRef.current.offsetHeight;
            const lineHeight = 18; // Fixed line height in pixels (smaller for page breaks)

            // Calculate exact number of lines needed, ensuring minimum
            const neededLines = Math.max(
              Math.ceil(contentHeight / lineHeight),
              20,
            );

            // Only update if there's a meaningful change
            setLineCount((prevCount) => {
              if (neededLines !== prevCount) {
                return neededLines;
              }
              return prevCount;
            });

            // Ensure line numbers container matches content height exactly
            lineNumbersRef.current.style.height = `${contentHeight}px`;
          }
        });
      }
    };

    // Delay initial measurement to ensure content is fully rendered
    const initialTimeout = setTimeout(() => {
      updateLineCount();
    }, 100);

    // Use ResizeObserver for more reliable updates
    let resizeObserver: ResizeObserver | null = null;

    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        // Debounce rapid resize events
        requestAnimationFrame(() => {
          updateLineCount();
        });
      });

      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
      }
    }

    return () => {
      clearTimeout(initialTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [data]);

  const formatText = React.useCallback((text: string) => {
    // Safety check for undefined/null text
    if (!text || typeof text !== "string") {
      return null;
    }

    // If text contains HTML tags, render as HTML
    if (text.includes("<")) {
      return (
        <div
          className="resume-rich-text"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }
    // Otherwise, treat as plain text with line breaks
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  }, []);

  const formatLinkText = React.useCallback(
    (text: string) => {
      // Safety check for undefined/null text
      if (!text || typeof text !== "string") {
        return null;
      }

      // Check if text is a URL
      if (text.startsWith("http://") || text.startsWith("https://")) {
        return (
          <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline decoration-1"
          >
            {text}
          </a>
        );
      }

      // Otherwise, treat as regular text
      return formatText(text);
    },
    [formatText],
  );

  return (
    <div className="w-fit">
      <div
        id="resume-content"
        className="text-xs font-mono shadow-2xl relative"
        style={{
          backgroundColor: "#2d3748",
          color: "#4fd1c7",
          padding: "1.5rem", // Tighter padding to save page breaks
          minHeight: "1122px", // A4 height in pixels (29.7cm at 96 DPI)
          minWidth: "794px", // A4 width in pixels (21cm at 96 DPI)
          width: "794px", // Fixed width to prevent flex issues
          margin: "0", // Remove auto margin to prevent left space in PDF
          borderRadius: "8px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Copyright text at top right border */}
        {data.showCopyright && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-600 font-normal whitespace-nowrap z-10">
            CV made with{" "}
            <a
              href="https://code-style-cv-generator.quang.work"
              target="_blank"
              rel="noopener noreferrer"
              className="copyright-link text-inherit hover:text-gray-500 underline decoration-1"
            >
              https://code-style-cv-generator.quang.work
            </a>
          </div>
        )}

        <div>
          {/* Terminal Header */}
          <div className="mb-5">
            <div className="flex items-center flex-wrap gap-4 mb-3">
              <div className="shrink-0">
                {data.avatar ? (
                  <img
                    src={data.avatar}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-2 border-green-400"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-600 border-2 border-green-400 flex items-center justify-center"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1">
                  <span className="text-green-400">&lt;</span>
                  <span className="text-white">CV</span>
                  <span className="text-green-400">&gt;</span>
                </div>
                <div className="text-xl text-white font-bold">{data.name}</div>
                <div className="text-xs text-gray-400">{data.title}</div>
              </div>
              <div className="basic-info text-left text-[11px] text-gray-300 space-y-0.5">
                {data.yearOfBirth && (
                  <div>
                    <span>🎂 Year of Birth: {data.yearOfBirth}</span>
                  </div>
                )}
                {data.gender && (
                  <div>
                    <span>👤 Gender: {data.gender}</span>
                  </div>
                )}
                {data.phone && (
                  <div>
                    <span>📱 Phone: {data.phone}</span>
                  </div>
                )}
                {data.email && (
                  <div>
                    <span>📧 Email: {data.email}</span>
                  </div>
                )}
                {data.location && (
                  <div>
                    <span className="whitespace-nowrap">
                      📍 Location: {data.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="resume-body flex gap-4">
            {/* Line Numbers */}
            <div
              ref={lineNumbersRef}
              className="text-gray-600 text-[10px] leading-relaxed overflow-hidden"
              style={{
                paddingTop: "1px",
                width: "20px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div
                  key={i}
                  className="text-right flex-none"
                  style={{ lineHeight: "1.25", height: "18px" }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Content */}
            <div
              className="resume-main-content flex gap-4 flex-1 min-w-0 h-fit"
              ref={contentRef}
            >
              {/* Left Column */}
              <div className="space-y-4 flex-[6] min-w-0">
                {/* Summary */}
                <section>
                  <h2 className="text-orange-400 text-sm font-bold mb-2">
                    /summary
                  </h2>
                  <div className="text-gray-300 leading-relaxed text-[11px]">
                    {formatLinkText(data.summary)}
                  </div>
                </section>

                {/* Work Experience */}
                <section>
                  <h2 className="text-orange-400 text-sm font-bold mb-2">
                    /work experience
                  </h2>
                  <div className="flex flex-col gap-5">
                    {data.workExperience?.map((job, index) => (
                      <div
                        key={index}
                        className={
                          index < (data.workExperience?.length ?? 1) - 1
                            ? "pb-5 border-b border-gray-600"
                            : ""
                        }
                      >
                        <div className="mb-1">
                          <div className="flex justify-between items-start mb-0.5 gap-2">
                            <h3 className="text-white font-semibold text-xs flex-1">
                              {job.position}
                            </h3>
                            <span
                              className="font-bold text-xs prevent-period-break whitespace-nowrap"
                              style={{ color: "#8b5cf6" }}
                            >
                              {job.period}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">
                            <span
                              style={{ color: "#ef4444" }}
                              className="font-semibold"
                            >
                              🏢 {job.company}
                            </span>
                          </p>
                        </div>
                        <div className="text-gray-300 text-[11px] leading-relaxed">
                          {formatLinkText(job.description)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-4 flex-[4] min-w-0">
                {/* Custom Sections */}
                {data.customSections?.map((section, index) => (
                  <section key={section.id}>
                    <h2 className="text-orange-400 text-sm font-bold mb-2">
                      /{section.title.toLowerCase()}
                    </h2>
                    <div className="space-y-3">
                      {section.items?.map((item, itemIndex) => (
                        <div
                          key={item.id}
                          className={
                            itemIndex < (section.items?.length ?? 1) - 1
                              ? "mb-3 pb-3 border-b border-gray-600"
                              : "mb-3"
                          }
                        >
                          <div className="mb-1">
                            <div className="flex justify-between items-start mb-0.5 gap-2">
                              {item.title && (
                                <h3 className="text-white font-semibold text-xs flex-1 min-w-0">
                                  {item.title}
                                </h3>
                              )}
                              {item.period && (
                                <span
                                  className="font-bold text-xs prevent-period-break whitespace-nowrap shrink-0"
                                  style={{ color: "#8b5cf6" }}
                                >
                                  {item.period}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.description && (
                            <div className="text-gray-300 text-[11px] leading-relaxed">
                              {formatLinkText(item.description)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
