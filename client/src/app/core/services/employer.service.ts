import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import {
  EmployerDashboardSummary,
  EmployerJobItem,
  EmployerApplicant,
  CreateJobPayload,
  CompanyProfile
} from '../models/employer.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployerService {
  private readonly api = inject(ApiService);

  public readonly summary = signal<EmployerDashboardSummary | null>(null);
  public readonly jobs = signal<EmployerJobItem[]>([]);
  public readonly applicants = signal<EmployerApplicant[]>([]);
  public readonly companyProfile = signal<CompanyProfile | null>(null);
  public readonly loadingSummary = signal<boolean>(false);
  public readonly loadingJobs = signal<boolean>(false);
  public readonly loadingApplicants = signal<boolean>(false);
  public readonly loadingCompanyProfile = signal<boolean>(false);
  public readonly filterJobId = signal<string | null>(null);

  loadSummary(): Observable<EmployerDashboardSummary> {
    this.loadingSummary.set(true);
    return this.api.get<EmployerDashboardSummary>('/api/v1/employer/summary').pipe(
      tap({
        next: (data) => {
          this.summary.set(data);
          this.loadingSummary.set(false);
        },
        error: () => this.loadingSummary.set(false)
      })
    );
  }

  loadJobs(): Observable<EmployerJobItem[]> {
    this.loadingJobs.set(true);
    return this.api.get<EmployerJobItem[]>('/api/v1/employer/jobs').pipe(
      tap({
        next: (items) => {
          this.jobs.set(items);
          this.loadingJobs.set(false);
        },
        error: () => this.loadingJobs.set(false)
      })
    );
  }

  loadApplicants(jobId?: string, sortByScore = false): Observable<EmployerApplicant[]> {
    this.loadingApplicants.set(true);
    const params: any = {};
    if (jobId) params.jobId = jobId;
    if (sortByScore) params.sortByScore = 'true';
    return this.api.get<EmployerApplicant[]>('/api/v1/employer/applicants', params).pipe(
      tap({
        next: (candidates) => {
          this.applicants.set(candidates);
          this.loadingApplicants.set(false);
        },
        error: () => this.loadingApplicants.set(false)
      })
    );
  }

  createJob(payload: CreateJobPayload): Observable<{ jobId: string }> {
    return this.api.post<{ jobId: string }>('/api/v1/employer/jobs', payload).pipe(
      tap(() => {
        this.loadJobs().subscribe();
        this.loadSummary().subscribe();
      })
    );
  }

  updateJobStatus(jobId: string, status: number): Observable<{ success: boolean }> {
    return this.api.put<{ success: boolean }>(`/api/v1/employer/jobs/${jobId}/status`, { status }).pipe(
      tap(() => {
        this.jobs.set(
          this.jobs().map((j) => (j.id === jobId ? { ...j, status } : j))
        );
        this.loadSummary().subscribe();
      })
    );
  }

  updateApplicantStage(applicationId: string, newStatus: number, notes?: string): Observable<{ success: boolean }> {
    return this.api.put<{ success: boolean }>(`/api/v1/employer/applications/${applicationId}/stage`, {
      newStatus,
      notes
    }).pipe(
      tap(() => {
        this.applicants.set(
          this.applicants().map((app) => {
            if (app.applicationId === applicationId) {
              const prevStatus = app.status;
              const newHistory = [
                {
                  id: 'local-' + Date.now(),
                  fromStatus: prevStatus,
                  toStatus: newStatus,
                  note: notes,
                  changedAtUtc: new Date().toISOString()
                },
                ...app.statusHistory
              ];
              return {
                ...app,
                status: newStatus,
                employerNotes: notes || app.employerNotes,
                statusHistory: newHistory
              };
            }
            return app;
          })
        );
        this.loadSummary().subscribe();
      })
    );
  }

  scoreApplicant(applicationId: string): Observable<any> {
    return this.api.post<any>(`/api/v1/employer/applications/${applicationId}/score`, {}).pipe(
      tap((res) => {
        this.applicants.set(
          this.applicants().map((app) => {
            if (app.applicationId === applicationId) {
              return {
                ...app,
                aiMatchScore: res.matchScore,
                aiSkillsScore: res.skillsScore,
                aiExperienceScore: res.experienceScore,
                aiStrengths: JSON.stringify(res.strengths),
                aiMissingSkills: JSON.stringify(res.missingSkills),
                aiRecommendation: res.recommendation,
                aiScoredAtUtc: new Date().toISOString()
              };
            }
            return app;
          })
        );
      })
    );
  }

  batchScoreApplicants(jobId: string): Observable<{ scoredCount: number }> {
    return this.api.post<{ scoredCount: number }>(`/api/v1/employer/jobs/${jobId}/score-applicants`, {}).pipe(
      tap(() => {
        this.loadApplicants(jobId).subscribe();
      })
    );
  }

  loadCompanyProfile(): Observable<CompanyProfile> {
    this.loadingCompanyProfile.set(true);
    return this.api.get<CompanyProfile>('/api/v1/employer/company').pipe(
      tap({
        next: (profile) => {
          this.companyProfile.set(profile);
          this.loadingCompanyProfile.set(false);
        },
        error: () => this.loadingCompanyProfile.set(false)
      })
    );
  }

  updateCompanyProfile(payload: Partial<CompanyProfile>): Observable<CompanyProfile> {
    return this.api.put<CompanyProfile>('/api/v1/employer/company', payload).pipe(
      tap((updated) => {
        this.companyProfile.set(updated);
      })
    );
  }

  updateJob(jobId: string, payload: CreateJobPayload): Observable<{ jobId: string }> {
    return this.api.put<{ jobId: string }>(`/api/v1/employer/jobs/${jobId}`, payload).pipe(
      tap(() => {
        this.loadJobs().subscribe();
        this.loadSummary().subscribe();
      })
    );
  }

  deleteJob(jobId: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/api/v1/employer/jobs/${jobId}`).pipe(
      tap(() => {
        this.jobs.set(this.jobs().filter((j) => j.id !== jobId));
        this.loadSummary().subscribe();
      })
    );
  }
}
