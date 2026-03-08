"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Import the styles
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [isHtmlView, setIsHtmlView] = useState(false);

  // Helper function to strip outer paragraph tags for HTML view
  const stripOuterParagraph = (html: string | undefined): string => {
    if (html == null) return "";
    const trimmed = html.trim();
    if (trimmed.startsWith("<p>") && trimmed.endsWith("</p>")) {
      return trimmed.slice(3, -4);
    }
    return html;
  };

  // Helper function to ensure content is wrapped in paragraph tags for rich text
  const ensureParagraphWrapper = (html: string | undefined): string => {
    if (html == null) return "<p><br></p>";
    const trimmed = html.trim();
    if (!trimmed) return "<p><br></p>";
    if (trimmed.startsWith("<p>") && trimmed.endsWith("</p>")) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  };

  // Get the display value for HTML view (without outer p tags)
  const htmlDisplayValue = stripOuterParagraph(value);

  // Handle HTML view value changes
  const handleHtmlChange = (newHtml: string) => {
    const wrappedHtml = ensureParagraphWrapper(newHtml);
    onChange(wrappedHtml);
  };

  // Ignore ReactQuill's initial onChange on mount - it fires with normalized HTML
  // (spaces → &nbsp;) which corrupts content when switching to Sections tab.
  const skipNextChange = React.useRef(true);
  React.useEffect(() => {
    const id = setTimeout(() => {
      skipNextChange.current = false;
    }, 100); // Allow Quill (dynamically loaded) to finish init before accepting changes
    return () => clearTimeout(id);
  }, []);
  const handleQuillChange = (newValue: string) => {
    if (skipNextChange.current) return;
    onChange(newValue);
  };

  // Configure the toolbar with essential formatting options including indent and link
  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline"],
        [
          {
            color: [
              "#000000",
              "#e60000",
              "#ff9900",
              "#ffff00",
              "#008a00",
              "#0066cc",
              "#9933ff",
              "#ffffff",
              "#facccc",
              "#ffebcc",
              "#ffffcc",
              "#cce8cc",
              "#cce0f5",
              "#ebd6ff",
              "#bbbbbb",
              "#f06666",
              "#ffc266",
              "#ffff66",
              "#66b966",
              "#66a3e0",
              "#c285ff",
              "#888888",
              "#a10000",
              "#b26b00",
              "#b2b200",
              "#006100",
              "#0047b2",
              "#6b24b2",
              "#444444",
              "#5c0000",
              "#663d00",
              "#666600",
              "#003700",
              "#002966",
              "#3d1466",
            ],
          },
        ],
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        ["link"], // link button
        ["clean"], // remove formatting button
      ],
    }),
    []
  );

  // Define the formats that are allowed
  const formats = ["bold", "italic", "underline", "color", "indent", "link"];

  return (
    <div className={`${className} rich-text-editor`}>
      {isHtmlView ? (
        <div className="html-view-container">
          {/* Custom toolbar for HTML view */}
          <div className="ql-toolbar ql-snow border-b border-gray-300 p-2">
            <Button
              type="button"
              onClick={() => setIsHtmlView(false)}
              className="text-xs px-2 py-1 h-auto"
              size="sm"
              variant="default"
              title="Back to Rich Text Editor"
            >
              {"</>"}
            </Button>
            <span className="ml-2 text-sm text-gray-600">HTML View</span>
          </div>
          <textarea
            value={htmlDisplayValue}
            onChange={(e) => handleHtmlChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-40 p-3 border-0 border-t border-gray-300 rounded-none font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              fontSize: "12px",
              lineHeight: "1.4",
            }}
          />
        </div>
      ) : (
        <div className="rich-text-container">
          {/* Custom toolbar extension */}
          <div className="custom-toolbar-extension border-b border-gray-300 p-2 bg-gray-50">
            <Button
              type="button"
              onClick={() => setIsHtmlView(true)}
              className="text-xs px-2 py-1 h-auto"
              size="sm"
              variant="outline"
              title="View HTML Source"
            >
              {"</>"}
            </Button>
            <span className="ml-2 text-sm text-gray-600">HTML View</span>
          </div>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={handleQuillChange}
            placeholder={placeholder}
            modules={modules}
            formats={formats}
          />
        </div>
      )}
    </div>
  );
}
