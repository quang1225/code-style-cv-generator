export interface ResumeData {
  name: string;
  title: string;
  location: string;
  yearOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  avatar?: string;
  summary: string;
  showCopyright: boolean;
  workExperience: {
    position: string;
    company: string;
    period: string;
    description: string;
  }[];
  customSections: {
    id: string;
    title: string;
    items: {
      id: string;
      title: string;
      description: string;
      period: string;
    }[];
  }[];
}
