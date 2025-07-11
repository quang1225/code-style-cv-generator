'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ResumeData } from '../types/resume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Camera, User } from 'lucide-react'

interface ResumeFormProps {
  data: ResumeData
  onUpdate: (data: ResumeData) => void
  onClose: () => void
  isInline?: boolean
}

// Debounce hook for performance optimization
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const ResumeForm: React.FC<ResumeFormProps> = ({ data, onUpdate, onClose, isInline = false }) => {
  const [formData, setFormData] = useState<ResumeData>(data)
  const [activeTab, setActiveTab] = useState('personal')

  // Debounced form data for performance optimization
  const debouncedFormData = useDebounce(formData, 300)

  // Update parent component when debounced data changes
  useEffect(() => {
    if (JSON.stringify(debouncedFormData) !== JSON.stringify(data)) {
      onUpdate(debouncedFormData)
    }
  }, [debouncedFormData, onUpdate, data])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleWorkExperienceChange = useCallback((index: number, field: string, value: string) => {
    setFormData(prev => {
      const newWorkExperience = [...prev.workExperience]
      newWorkExperience[index] = { ...newWorkExperience[index], [field]: value }
      return { ...prev, workExperience: newWorkExperience }
    })
  }, [])

  const handleEducationChange = useCallback((index: number, field: string, value: string) => {
    setFormData(prev => {
      const newEducation = [...prev.education]
      newEducation[index] = { ...newEducation[index], [field]: value }
      return { ...prev, education: newEducation }
    })
  }, [])

  const handleSkillsChange = useCallback((category: string, value: string) => {
    setFormData(prev => ({ ...prev, skills: { ...prev.skills, [category]: value } }))
  }, [])

  const addWorkExperience = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { position: '', company: '', period: '', description: '' }
      ]
    }))
  }, [])

  const removeWorkExperience = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }))
  }, [])

  const addEducation = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', school: '', period: '' }
      ]
    }))
  }, [])

  const removeEducation = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const formContent = (
    <div className={isInline ? "" : "p-6"}>
      {!isInline && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Resume</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            ×
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="work">Work</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="personal" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-picture">Profile Picture</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {formData.avatar ? (
                        <img 
                          src={formData.avatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label 
                      htmlFor="profile-picture"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                    </label>
                  </div>
                  <div className="flex-1">
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Upload your profile picture</p>
                      <p className="text-xs">JPG, PNG or GIF (max 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-2"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="professional-title">Professional Title</Label>
                <Input
                  id="professional-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-2"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  rows={4}
                  className="mt-2"
                  placeholder="Write a brief summary of your experience and skills"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="work" className="space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Work Experience</h3>
                <Button
                  type="button"
                  onClick={addWorkExperience}
                  variant="outline"
                  size="sm"
                >
                  Add Experience
                </Button>
              </div>
              {formData.workExperience.map((exp, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Experience {index + 1}</CardTitle>
                      <Button
                        type="button"
                        onClick={() => removeWorkExperience(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`position-${index}`}>Position</Label>
                        <Input
                          id={`position-${index}`}
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                          className="mt-1"
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`company-${index}`}>Company</Label>
                        <Input
                          id={`company-${index}`}
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                          className="mt-1"
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`period-${index}`}>Period</Label>
                        <Input
                          id={`period-${index}`}
                          type="text"
                          value={exp.period}
                          onChange={(e) => handleWorkExperienceChange(index, 'period', e.target.value)}
                          className="mt-1"
                          placeholder="e.g., 2020-2023"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={exp.description}
                          onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                          rows={3}
                          className="mt-1"
                          placeholder="Describe your role and achievements"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              {Object.entries(formData.skills).map(([category, skills]) => (
                <div key={category}>
                  <Label htmlFor={`skills-${category}`}>{category}</Label>
                  <Textarea
                    id={`skills-${category}`}
                    value={skills}
                    onChange={(e) => handleSkillsChange(category, e.target.value)}
                    rows={3}
                    className="mt-2"
                    placeholder="Enter skills separated by commas"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Education</h3>
                <Button
                  type="button"
                  onClick={addEducation}
                  variant="outline"
                  size="sm"
                >
                  Add Education
                </Button>
              </div>
              {formData.education.map((edu, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Education {index + 1}</CardTitle>
                      <Button
                        type="button"
                        onClick={() => removeEducation(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`degree-${index}`}>Degree</Label>
                        <Input
                          id={`degree-${index}`}
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          className="mt-1"
                          placeholder="e.g., Bachelor's in Computer Science"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`school-${index}`}>School</Label>
                        <Input
                          id={`school-${index}`}
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                          className="mt-1"
                          placeholder="University name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edu-period-${index}`}>Period</Label>
                        <Input
                          id={`edu-period-${index}`}
                          type="text"
                          value={edu.period}
                          onChange={(e) => handleEducationChange(index, 'period', e.target.value)}
                          className="mt-1"
                          placeholder="e.g., 2018-2022"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )

  return isInline ? formContent : (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {formContent}
      </div>
    </div>
  )
}

export default ResumeForm 