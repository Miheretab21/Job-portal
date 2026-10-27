export interface EmployerDashboardSummary {
  activeJobsCount: number;
  totalApplicantsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
}

export interface EmployerJobItem {
  id: string;
  title: string;
  categoryName: string;
  location: string;
  isRemote: boolean;
  jobType: number;
  status: number;
  viewsCount: number;
  applicantsCount: number;
  createdAtUtc: string;
}

export interface EmployerApplicantHistory {
  id: string;
  fromStatus: number;
  toStatus: number;
  note?: string;
  changedAtUtc: string;
}

export interface EmployerApplicant {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  resumeUrl: string;
  coverLetter?: string;
  status: number;
  appliedAtUtc: string;
  employerNotes?: string;
  statusHistory: EmployerApplicantHistory[];
  aiMatchScore?: number;
  aiSkillsScore?: number;
  aiExperienceScore?: number;
  aiStrengths?: string;
  aiMissingSkills?: string;
  aiRecommendation?: string;
  aiScoredAtUtc?: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  isVerified: boolean;
  logoUrl?: string;
}

export interface CreateJobPayload {
  title: string;
  categoryId: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location: string;
  jobType: number;
  experienceLevel: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  isRemote: boolean;
  skillNames: string[];
  companyDescription?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  companySize?: string;
}
