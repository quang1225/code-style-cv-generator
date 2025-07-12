'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ResumeData } from '../types/resume'

interface ResumePreviewProps {
  data: ResumeData
}

const ResumePreview: React.FC<ResumePreviewProps> = React.memo(({ data }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [lineCount, setLineCount] = useState(50)

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight
      const lineHeight = 20 // Adjusted line height to match actual rendered height
      const calculatedLines = Math.ceil(contentHeight / lineHeight)
      setLineCount(Math.max(calculatedLines + 5, 30)) // Add small buffer, minimum 30 lines, no max cap
    }
  }, [data])

  const formatText = (text: string) => {
    // If text contains HTML tags, render as HTML
    if (text.includes('<')) {
      return <div className="resume-rich-text" dangerouslySetInnerHTML={{ __html: text }} />
    }
    // Otherwise, treat as plain text with line breaks
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div 
        id="resume-content"
        className="text-sm font-mono shadow-2xl"
        style={{ 
          backgroundColor: '#2d3748', 
          color: '#4fd1c7',
          fontFamily: 'Monaco, Menlo, monospace',
          padding: '3rem 0', // Remove left/right padding for full width PDF
          minHeight: '1122px', // A4 height in pixels (29.7cm at 96 DPI)
          width: '794px', // A4 width in pixels (21cm at 96 DPI)
          margin: '0 auto',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ padding: '0 3rem' }}>
          {/* Terminal Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-4">
              <div className="shrink-0">
                {data.avatar ? (
                  <img 
                    src={data.avatar} 
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-green-400"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-600 border-2 border-green-400 flex items-center justify-center">
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold mb-2 relative">
                  <span className="text-green-400">&lt;</span>
                  <span className="text-white">CV</span>
                  <span className="text-green-400">&gt;</span>
                  {data.showCopyright && (
                    <span className="absolute left-[4.5rem] top-0 text-[10px] text-gray-600 font-normal whitespace-nowrap">
                      Made with{' '}
                      <a 
                        href="https://code-style-cv-generator.quang.work/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-500"
                      >
                        https://code-style-cv-generator.quang.work/
                      </a>
                    </span>
                  )}
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

          <div className="flex gap-6">
            {/* Line Numbers */}
            <div className="text-gray-600 text-xs leading-relaxed" style={{ paddingTop: '1px', width: '60px', flexShrink: 0 }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="text-right" style={{ lineHeight: '1.25', height: '20px' }}>
                  {i + 1}
                </div>
              ))}
            </div>
            
            {/* Content */}
            <div className="flex gap-6 flex-1" ref={contentRef}>
              {/* Left Column */}
              <div className="flex-1 space-y-6 max-w-md">
                {/* Summary */}
                <section>
                  <h2 className="text-orange-400 text-base font-bold mb-3">/summary</h2>
                  <div className="text-gray-300 leading-relaxed text-xs">{formatText(data.summary)}</div>
                </section>

                {/* Work Experience */}
                <section>
                  <h2 className="text-orange-400 text-base font-bold mb-3">/work experience</h2>
                  <div className="space-y-4">
                    {data.workExperience.map((job, index) => (
                      <div key={index} className="mb-4">
                        <div className="mb-2">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-white font-semibold text-sm">{job.position}</h3>
                            <span className="text-green-400 font-bold text-sm">{job.period}</span>
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
              <div className="flex-1 space-y-6 max-w-xs">
                {/* Custom Sections */}
                {data.customSections.map((section, index) => (
                  <section key={section.id}>
                    <h2 className="text-orange-400 text-base font-bold mb-3">/{section.title.toLowerCase()}</h2>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={item.id} className="mb-4">
                          <div className="mb-2">
                            <div className="flex justify-between items-start mb-1">
                              {item.title && <h3 className="text-white font-semibold text-sm">{item.title}</h3>}
                              {item.period && <span className="text-green-400 font-bold text-sm">{item.period}</span>}
                            </div>
                          </div>
                          {item.description && <div className="text-gray-300 text-xs leading-relaxed">{formatText(item.description)}</div>}
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
  )
})

ResumePreview.displayName = 'ResumePreview'

export default ResumePreview 