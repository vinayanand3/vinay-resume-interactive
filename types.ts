export interface SocialLink {
  platform: string;
  url: string;
  iconName: 'Github' | 'Linkedin' | 'Twitter' | 'Mail' | 'FileText';
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  technologies: string[];
  // Optional link to a project story (used to embed project details under experience)
  projectId?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  period: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  image?: string;
  // Optional richer narrative for a dedicated project detail view
  details?: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  bio: string;
  location: string;
  availability: boolean;
  // Used by "View Full Resume" link (kept separate from socials/icons)
  resumeUrl: string;
  socials: SocialLink[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: SkillGroup[];
}