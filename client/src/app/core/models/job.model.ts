export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  jobsCount: number;
}

export interface CompanySummary {
  id: string;
  name: string;
  logoUrl?: string;
  location?: string;
  isVerified: boolean;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface JobListItem {
  id: string;
  title: string;
  location: string;
  jobType: number; // 1: FullTime, 2: PartTime, 3: Contract, 4: Remote, 5: Internship
  experienceLevel: number; // 1: Entry, 2: Mid, 3: Senior, 4: Lead, 5: Executive
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  isRemote: boolean;
  createdAtUtc: string;
  deadlineUtc?: string;
  company: CompanySummary;
  category: CategorySummary;
  skills: string[];
  numberOfPositions?: number;
  educationLevel?: string;
  yearsOfExperience?: string;
  languageRequirements?: string;
  isSalaryNegotiable?: boolean;
  amharicTitle?: string;
  amharicDescription?: string;
  city?: string;
}

export interface JobDetail extends JobListItem {
  description: string;
  requirements?: string;
  benefits?: string;
  viewsCount: number;
  status: number;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface FacetItem {
  key: string;
  label: string;
  count: number;
  extra?: string | null;
}

export interface JobFacets {
  skills: FacetItem[];
  categories: FacetItem[];
  experienceLevels: FacetItem[];
  jobTypes: FacetItem[];
  minSalary: number;
  maxSalary: number;
  totalJobs: number;
  remoteJobsCount: number;
}

export interface JobFilter {
  search?: string;
  categorySlug?: string;
  isRemote?: boolean;
  jobType?: number;
  jobTypes?: number[];
  experienceLevel?: number;
  experienceLevels?: number[];
  skill?: string;
  skills?: string[];
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  location?: string;
  educationLevel?: string;
  city?: string;
  isNegotiable?: boolean;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
}
