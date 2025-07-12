"use client";

import React, { useRef, useEffect, useState } from "react";
import { ResumeData } from "../types/resume";

interface ResumePreviewProps {
  data: ResumeData;
}

/*
⚠️  IMPORTANT: PDF CONSISTENCY MAINTENANCE

When adding new Tailwind classes to this component, ensure they are 
mapped in utils/pdfGenerator.ts with their exact hex/rem values.

The PDF generator uses a custom CSS override system that requires 
manual synchronization with the classes used here.
*/

const ResumePreview: React.FC<ResumePreviewProps> = React.memo(({ data }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(50);

  useEffect(() => {
    try {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const lineHeight = 20; // Adjusted line height to match actual rendered height
        const calculatedLines = Math.ceil(contentHeight / lineHeight);
        setLineCount(Math.max(calculatedLines + 5, 30)); // Add small buffer, minimum 30 lines, no max cap
      }
    } catch (error) {
      console.error("Error calculating line count:", error);
      setLineCount(30); // Fallback to default
    }
  }, [data]);

  const formatText = (text: string) => {
    // Safety check for undefined/null text
    if (!text || typeof text !== "string") {
      return null;
    }

    // If text contains HTML tags, render as HTML
    if (text.includes("<")) {
      return <div className="resume-rich-text" dangerouslySetInnerHTML={{ __html: text }} />;
    }
    // Otherwise, treat as plain text with line breaks
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="mx-2">
      <div
        id="resume-content"
        className="text-sm font-mono shadow-2xl relative"
        style={{
          backgroundColor: "#2d3748",
          color: "#4fd1c7",
          fontFamily: "Monaco, Menlo, monospace",
          padding: "2rem 0", // Reduced padding for more space
          minHeight: "1122px", // A4 height in pixels (29.7cm at 96 DPI)
          width: "794px", // A4 width in pixels (21cm at 96 DPI)
          margin: "0 auto",
          borderRadius: "8px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Copyright text at top right border */}
        {data.showCopyright && (
          <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-normal whitespace-nowrap z-10">
            CV made with{" "}
            <a
              href="https://code-style-cv-generator.quang.work/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-500"
            >
              https://code-style-cv-generator.quang.work/
            </a>
          </div>
        )}

        <div style={{ padding: "0 2rem" }}>
          {/* Terminal Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-4">
              <div className="shrink-0">
                {data.avatar ? (
                  <img src={data.avatar} alt="Profile" className="w-24 h-24 rounded-full border-2 border-green-400" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-600 border-2 border-green-400 flex items-center justify-center"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold mb-2">
                  <span className="text-green-400">&lt;</span>
                  <span className="text-white">CV</span>
                  <span className="text-green-400">&gt;</span>
                </div>
                <div className="text-2xl text-white font-bold">{data.name}</div>
                <div className="text-sm text-gray-400">{data.title}</div>
              </div>
              <div className="text-left text-xs text-gray-300 space-y-1">
                {data.email && (
                  <div>
                    <span>Email: {data.email}</span>
                  </div>
                )}
                {data.website && (
                  <div>
                    <span>Website: </span>
                    <a
                      href={data.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {data.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Line Numbers */}
            <div
              className="text-gray-600 text-xs leading-relaxed"
              style={{ paddingTop: "1px", width: "36px", flexShrink: 0 }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="text-right" style={{ lineHeight: "1.25", height: "20px" }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex gap-8 flex-1" ref={contentRef}>
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                {/* Summary */}
                <section>
                  <h2 className="text-orange-400 text-base font-bold mb-3">/summary</h2>
                  <div className="text-gray-300 leading-relaxed text-xs">{formatText(data.summary)}</div>
                </section>

                {/* Work Experience */}
                <section>
                  <h2 className="text-orange-400 text-base font-bold mb-3">/work experience</h2>
                  <div className="space-y-4">
                    {data.workExperience?.map((job, index) => (
                      <div key={index} className="mb-4">
                        <div className="mb-2">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h3 className="text-white font-semibold text-sm flex-1">{job.position}</h3>
                            <span className="text-green-400 font-bold text-sm prevent-period-break whitespace-nowrap">
                              {job.period}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{job.company}</p>
                        </div>
                        <div className="text-gray-300 text-xs leading-relaxed">{formatText(job.description)}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="flex-1 space-y-6 min-w-0">
                {/* Custom Sections */}
                {data.customSections?.map((section, index) => (
                  <section key={section.id}>
                    <h2 className="text-orange-400 text-base font-bold mb-3">/{section.title.toLowerCase()}</h2>
                    <div className="space-y-4">
                      {section.items?.map((item, itemIndex) => (
                        <div key={item.id} className="mb-4">
                          <div className="mb-2">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              {item.title && (
                                <h3 className="text-white font-semibold text-sm flex-1 min-w-0">{item.title}</h3>
                              )}
                              {item.period && (
                                <span className="text-green-400 font-bold text-sm prevent-period-break whitespace-nowrap shrink-0">
                                  {item.period}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.description && (
                            <div className="text-gray-300 text-xs leading-relaxed">{formatText(item.description)}</div>
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
