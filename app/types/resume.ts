export interface ResumeData {
  name: string
  title: string
  avatar?: string
  summary: string
  workExperience: {
    position: string
    company: string
    period: string
    description: string
  }[]
  skills: {
    [key: string]: string
  }
  education: {
    degree: string
    school: string
    period: string
  }[]
  professionalDevelopment: {
    title: string
    organization: string
    period: string
  }[]
} 