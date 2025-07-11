'use client'

import { useState, useCallback } from 'react'
import ResumePreview from './components/ResumePreview'
import ResumeForm from './components/ResumeForm'
import { generatePDF } from './utils/pdfGenerator'
import { ResumeData } from './types/resume'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileDown, CheckCircle, AlertCircle } from 'lucide-react'

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: "Alexandra Morgan",
    title: "Professional_Title",
    location: "San Francisco, CA",
    email: "alexandra.morgan@email.com",
    website: "https://alexandra-morgan.dev",
    summary: "Experienced engineer with <strong>four years of expertise</strong> in leading up a global firm.<br><br>Demonstrated history of <em>improved productivity</em> and driven online sales from <strong style=\"color: #10b981;\">150,000</strong> annually to over <strong style=\"color: #10b981;\">3 million</strong> in a two-year period.<br><br>Key strengths include:<br>• <strong>Strategic leadership</strong><br>• <strong>Technical innovation</strong><br>• <strong>Team collaboration</strong>",
    showCopyright: true,
    workExperience: [
      {
        position: "job_position",
        company: "company_name",
        period: "2015-2023",
        description: "The description of an earlier job is very important for your CV. It highlights your <strong>main areas of focus</strong> and expertise and demonstrates your potential skills to use them efficiently.<br><br>Key achievements:<br>• <strong style=\"color: #10b981;\">Improved team productivity by 40%</strong><br>• <em>Led successful product launches</em><br>• <strong>Mentored junior developers</strong><br><br>Be sure to use a creative brief. <em>Data is not a must-do</em>, but it is a <strong>nice way to show prior working experience</strong>."
      },
      {
        position: "job_position",
        company: "company_name", 
        period: "2015-2023",
        description: "The description of an earlier job is very important for your CV. It highlights your <strong>main areas of focus</strong> and expertise and demonstrates your potential skills to use them efficiently.<br><br>Responsibilities:<br>• <strong>Technical architecture design</strong><br>• <em>Code reviews and quality assurance</em><br>• <strong style=\"color: #3b82f6;\">Cross-functional collaboration</strong><br><br>Be sure to use a creative brief. <em>Data is not a must-do</em>, but it is a <strong>nice way to show prior working experience</strong>."
      },
      {
        position: "job_position",
        company: "company_name",
        period: "2015-2023", 
        description: "The description of an earlier job is very important for your CV. It highlights your <strong>main areas of focus</strong> and expertise and demonstrates your potential skills to use them efficiently.<br><br>Core contributions:<br>• <strong style=\"color: #8b5cf6;\">Built scalable systems</strong><br>• <em>Optimized performance</em><br>• <strong>Delivered user-centric solutions</strong><br><br>Be sure to use a creative brief. <em>Data is not a must-do</em>, but it is a <strong>nice way to show prior working experience</strong>."
      },
      {
        position: "job_position",
        company: "company_name",
        period: "2015-2023",
        description: "The description of an earlier job is very important for your CV. It highlights your <strong>main areas of focus</strong> and expertise and demonstrates your potential skills to use them efficiently.<br><br>Impact areas:<br>• <strong style=\"color: #ef4444;\">Enhanced user experience</strong><br>• <em>Streamlined workflows</em><br>• <strong>Reduced technical debt</strong><br><br>Be sure to use a creative brief. <em>Data is not a must-do</em>, but it is a <strong>nice way to show prior working experience</strong>."
      }
    ],
    customSections: [
      {
        id: "1",
        title: "Skills",
        items: [
          {
            id: "1",
            title: "Programming Languages",
            description: "• <strong style=\"color: #f59e0b;\">JavaScript</strong>, <strong style=\"color: #3b82f6;\">TypeScript</strong><br>• <strong style=\"color: #10b981;\">Python</strong>, <strong style=\"color: #ef4444;\">Java</strong><br>• <strong style=\"color: #8b5cf6;\">Go</strong>, <em>Rust</em><br>• <strong>SQL</strong>, <em>NoSQL</em>",
            period: ""
          },
          {
            id: "2",
            title: "Frontend Technologies",
            description: "• <strong style=\"color: #3b82f6;\">React</strong>, <strong style=\"color: #10b981;\">Vue.js</strong>, <strong style=\"color: #ef4444;\">Angular</strong><br>• <strong>HTML5</strong>, <strong>CSS3</strong><br>• <strong style=\"color: #8b5cf6;\">Tailwind CSS</strong>, <em>Bootstrap</em><br>• <strong>Responsive Design</strong>",
            period: ""
          },
          {
            id: "3",
            title: "Backend & Cloud",
            description: "• <strong style=\"color: #10b981;\">Node.js</strong>, <strong>Express</strong><br>• <strong style=\"color: #f59e0b;\">AWS</strong>, <strong style=\"color: #3b82f6;\">Docker</strong><br>• <strong style=\"color: #8b5cf6;\">Kubernetes</strong>, <em>MongoDB</em><br>• <strong>CI/CD</strong>, <em>DevOps</em>",
            period: ""
          }
        ]
      },
      {
        id: "2",
        title: "Education",
        items: [
          {
            id: "1",
            title: "Bachelor of Science in Computer Science",
            description: "<strong style=\"color: #3b82f6;\">University of California, Berkeley</strong><br><br>• <strong>GPA: 3.8/4.0</strong><br>• <em>Dean's List (3 semesters)</em><br>• <strong>Relevant coursework:</strong> Data Structures, Algorithms, Software Engineering",
            period: "2015-2019"
          },
          {
            id: "2",
            title: "Master of Science in Software Engineering",
            description: "<strong style=\"color: #ef4444;\">Stanford University</strong><br><br>• <strong>GPA: 3.9/4.0</strong><br>• <em>Research focus: Distributed Systems</em><br>• <strong style=\"color: #10b981;\">Thesis:</strong> Scalable Microservices Architecture",
            period: "2019-2021"
          }
        ]
      },
      {
        id: "3",
        title: "Certifications",
        items: [
          {
            id: "1",
            title: "AWS Certified Solutions Architect",
            description: "<strong>Professional level certification</strong> in <em style=\"color: #f59e0b;\">cloud architecture</em><br><br>• <strong>Advanced AWS services knowledge</strong><br>• <em>Solutions design and implementation</em><br>• <strong style=\"color: #10b981;\">Cost optimization strategies</strong>",
            period: "2023"
          },
          {
            id: "2",
            title: "Google Cloud Professional Developer",
            description: "<strong>Advanced certification</strong> in <em style=\"color: #3b82f6;\">Google Cloud development</em><br><br>• <strong>Cloud-native application development</strong><br>• <em>Containerization and orchestration</em><br>• <strong style=\"color: #8b5cf6;\">CI/CD pipeline implementation</strong>",
            period: "2022"
          }
        ]
      }
    ]
  })

  const [pdfStatus, setPdfStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleGeneratePDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true)
      setPdfStatus({ type: null, message: '' })
      const result = await generatePDF()
      setPdfStatus({
        type: result.success ? 'success' : 'error',
        message: result.message
      })
      
      // Auto-hide the status after 5 seconds
      setTimeout(() => {
        setPdfStatus({ type: null, message: '' })
      }, 5000)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setPdfStatus({
        type: 'error',
        message: 'An unexpected error occurred while generating the PDF.'
      })
      
      // Auto-hide the status after 5 seconds
      setTimeout(() => {
        setPdfStatus({ type: null, message: '' })
      }, 5000)
    } finally {
      setIsGeneratingPDF(false)
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
                <div className="mt-6 space-y-4">
                  {pdfStatus.type && (
                    <Alert variant={pdfStatus.type === 'error' ? 'destructive' : 'default'}>
                      {pdfStatus.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {pdfStatus.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={handleGeneratePDF}
                    className="w-full"
                    size="lg"
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Generate PDF
                      </>
                    )}
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