export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: number; // 1: JobSeeker, 2: Employer, 3: Admin
  avatarUrl?: string;
  companyId?: string;
  seekerProfileId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: User;
}
