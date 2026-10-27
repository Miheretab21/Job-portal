export interface TopCategoryMetric {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  activeJobsCount: number;
}

export interface PlatformActivity {
  type: 'application' | 'job' | 'user';
  title: string;
  description: string;
  timestampUtc: string;
}

export interface PlatformAnalytics {
  totalUsers: number;
  seekerCount: number;
  employerCount: number;
  adminCount: number;
  totalJobs: number;
  publishedJobs: number;
  draftJobs: number;
  archivedJobs: number;
  totalApplications: number;
  hiredApplications: number;
  inReviewApplications: number;
  rejectedApplications: number;
  totalCategories: number;
  totalCompanies: number;
  topCategories: TopCategoryMetric[];
  recentActivities: PlatformActivity[];
}

export interface AdminJob {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  categoryId: string;
  categoryName: string;
  location: string;
  isRemote: boolean;
  status: number; // 1 = Draft, 2 = Published, 3 = Archived, 4 = Closed
  viewsCount: number;
  applicationsCount: number;
  createdAtUtc: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: number; // 1 = Seeker, 2 = Employer, 3 = Admin
  isLocked: boolean;
  lockoutEndUtc?: string;
  companyName?: string;
  applicationsCount: number;
  createdAtUtc: string;
  companyId?: string;
  isCompanyVerified?: boolean;
  companyLogoUrl?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}
