'use client'

import React from 'react'
import { ResumeData } from '../types/resume'

interface ResumePreviewProps {
  data: ResumeData
}

const ResumePreview: React.FC<ResumePreviewProps> = React.memo(({ data }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div 
        id="resume-content"
        className="text-sm font-mono shadow-2xl"
        style={{ 
          backgroundColor: '#2d3748', 
          color: '#4fd1c7',
          fontFamily: 'Monaco, Menlo, monospace',
          padding: '3rem',
          minHeight: '1122px', // A4 height in pixels (29.7cm at 96 DPI)
          width: '794px', // A4 width in pixels (21cm at 96 DPI)
          margin: '0 auto',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Terminal Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-4">
            <div className="flex-shrink-0">
              {data.avatar ? (
                <img 
                  src={data.avatar} 
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-2 border-green-400"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-600 border-2 border-green-400 flex items-center justify-center">
                  <span className="text-green-400 text-2xl">👤</span>
                </div>
              )}
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                <span className="text-green-400">&lt;</span>
                <span className="text-white">CV</span>
                <span className="text-green-400">&gt;</span>
              </div>
              <div className="text-2xl text-white font-bold">{data.name}</div>
              <div className="text-sm text-gray-400">({data.title})</div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Line Numbers */}
          <div className="text-gray-600 text-xs leading-relaxed pr-4" style={{ paddingTop: '1px' }}>
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i} className="text-right" style={{ lineHeight: '1.5' }}>
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Left Column */}
          <div className="flex-1 space-y-6 max-w-md">
            {/* Summary */}
            <section>
              <h2 className="text-orange-400 text-base font-bold mb-3">/summary</h2>
              <p className="text-gray-300 leading-relaxed text-sm">{data.summary}</p>
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
                    <p className="text-gray-300 text-xs leading-relaxed">{job.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-6 max-w-xs">
            {/* Skills */}
            <section>
              <h2 className="text-orange-400 text-base font-bold mb-3">/skills</h2>
              <div className="space-y-3">
                {Object.entries(data.skills).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="text-white font-semibold mb-1 text-sm">{category}</h3>
                    <p className="text-gray-300 text-xs leading-relaxed">{skills}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-orange-400 text-base font-bold mb-3">/education</h2>
              <div className="space-y-3">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{edu.degree}</h3>
                        <p className="text-gray-400 text-xs">{edu.school}</p>
                      </div>
                      <span className="text-green-400 text-xs font-bold">{edu.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Professional Development */}
            <section>
              <h2 className="text-orange-400 text-base font-bold mb-3">/professional development</h2>
              <div className="space-y-3">
                {data.professionalDevelopment.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                        <p className="text-gray-400 text-xs">{item.organization}</p>
                      </div>
                      <span className="text-green-400 text-xs font-bold">{item.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
})

ResumePreview.displayName = 'ResumePreview'

export default ResumePreview 