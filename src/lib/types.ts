export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  avatarUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  description: string;
}

export interface Resume {
  id?: string;
  userId: string;
  title: string;
  isPublic: boolean;
  visibility: 'public' | 'private';
  createdAt: any;
  updatedAt: any;
  themeColor: string;
  template: 'modern' | 'minimal' | 'classic' | 'professional' | 'creative';
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
}
