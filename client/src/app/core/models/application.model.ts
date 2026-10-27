export enum ApplicationStatus {
  Submitted = 1,
  InReview = 2,
  Shortlisted = 3,
  Interview = 4,
  Rejected = 5,
  Hired = 6,
  Withdrawn = 7
}

export interface ApplicationStatusHistoryDto {
  id: string;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  status?: ApplicationStatus;
  note?: string;
  notes?: string;
  changedAtUtc?: string;
  createdAtUtc?: string;
}

export interface ApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  isRemote?: boolean;
  status: ApplicationStatus;
  currentStatus?: ApplicationStatus;
  appliedAtUtc: string;
  resumeUrl?: string;
  coverLetter?: string;
  nextStep?: string;
  statusHistory: ApplicationStatusHistoryDto[];
}

export interface ApplyJobRequest {
  resumeUrl: string;
  coverLetter?: string;
}

export interface SavedJobDto {
  id: string;
  jobId: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  isRemote: boolean;
  jobType: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  savedAtUtc: string;
}
