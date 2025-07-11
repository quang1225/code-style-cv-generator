'use client'

import { useState, useCallback } from 'react'
import ResumePreview from './components/ResumePreview'
import ResumeForm from './components/ResumeForm'
import { generatePDF } from './utils/pdfGenerator'
import { ResumeData } from './types/resume'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: "Alexandra Morgan",
    title: "Professional_Title",
    summary: "Experienced engineer with four years of expertise in leading up a global firm. Demonstrated history of improved productivity and driven online sales from 150,000 annually to over 3 million in a two-year period.",
    workExperience: [
      {
        position: "job_position",
        company: "company_name",
        period: "2015-2023",
        description: "The description of an earlier job is very important for your CV. It highlights your main areas of focus and expertise and demonstrates your potential skills to use them efficiently. Be sure to use a creative brief. Data is not a must-do, but it is a nice way to show prior working experience."
      },
      {
        position: "job_position",
        company: "company_name", 
        period: "2015-2023",
        description: "The description of an earlier job is very important for your CV. It highlights your main areas of focus and expertise and demonstrates your potential skills to use them efficiently. Be sure to use a creative brief. Data is not a must-do, but it is a nice way to show prior working experience."
      },
      {
        position: "job_position",
        company: "company_name",
        period: "2015-2023", 
        description: "The description of an earlier job is very important for your CV. It highlights your main areas of focus and expertise and demonstrates your potential skills to use them efficiently. Be sure to use a creative brief. Data is not a must-do, but it is a nice way to show prior working experience."
      },
      {
        position: "job_position",
        company: "company_name",
        period: "2015-2023",
        description: "The description of an earlier job is very important for your CV. It highlights your main areas of focus and expertise and demonstrates your potential skills to use them efficiently. Be sure to use a creative brief. Data is not a must-do, but it is a nice way to show prior working experience."
      }
    ],
    skills: {
      "Customer_Focus": "JavaScript, React, Node.js, TypeScript, Python, Git",
      "Expertise": "Backend Development, Full-Stack Development, API Design, Database Management, Cloud Computing, DevOps, GraphQL"
    },
    education: [
      {
        degree: "Bachelor's Degree",
        school: "Major University",
        period: "2018 - 2022"
      },
      {
        degree: "Bachelor's Degree", 
        school: "Major University",
        period: "2018 - 2022"
      },
      {
        degree: "Bachelor's Degree",
        school: "Major University", 
        period: "2018 - 2022"
      }
    ],
    professionalDevelopment: [
      {
        title: "class/course/workshop",
        organization: "Organization/institution/company",
        period: "2018 - 2022"
      },
      {
        title: "class/course/workshop",
        organization: "Organization/institution/company",
        period: "2018 - 2022"
      }
    ]
  })

  const handleGeneratePDF = useCallback(async () => {
    try {
      await generatePDF()
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }, [])

  const handleUpdateResume = useCallback((newData: ResumeData) => {
    setResumeData(newData)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Code Style CV Generator</h1>
          <p className="text-muted-foreground mb-6">Generate a developer-style resume with terminal aesthetics</p>
        </div>
        
        <div className="flex gap-8 w-full">
          {/* Left side - Form (60% initially) */}
          <div className="w-[60%] peer-hover:w-0 smooth-expand overflow-hidden">
            <Card>
              <CardHeader>
                <CardTitle>Edit Resume</CardTitle>
                <CardDescription>
                  Update your resume information and see changes in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeForm
                  data={resumeData}
                  onUpdate={handleUpdateResume}
                  onClose={() => {}}
                  isInline={true}
                />
                <div className="mt-6">
                  <Button
                    onClick={handleGeneratePDF}
                    className="w-full"
                    size="lg"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Preview (40% initially, expands to CV content width on hover) */}
          <div className="w-[40%] hover:w-[950px] peer smooth-expand cursor-pointer">
            <Card className="smooth-expand hover:shadow-2xl">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Live preview of your resume (hover to expand)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto" style={{ maxHeight: '800px' }}>
                  <ResumePreview data={resumeData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 