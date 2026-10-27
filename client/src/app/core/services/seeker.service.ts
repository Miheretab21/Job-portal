import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { ApplicationDto, ApplicationStatus, ApplyJobRequest } from '../models/application.model';
import { JobListItem } from '../models/job.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeekerService {
  private readonly api = inject(ApiService);

  public readonly applications = signal<ApplicationDto[]>([]);
  public readonly savedJobs = signal<JobListItem[]>([]);
  public readonly savedJobIds = signal<Set<string>>(new Set<string>());

  public readonly loadingApplications = signal<boolean>(false);
  public readonly loadingSavedJobs = signal<boolean>(false);

  loadApplications(): Observable<ApplicationDto[]> {
    this.loadingApplications.set(true);
    return this.api.get<ApplicationDto[]>('/api/v1/me/applications').pipe(
      tap({
        next: (apps) => {
          this.applications.set(apps);
          this.loadingApplications.set(false);
        },
        error: () => this.loadingApplications.set(false)
      })
    );
  }

  loadSavedJobs(): Observable<JobListItem[]> {
    this.loadingSavedJobs.set(true);
    return this.api.get<JobListItem[]>('/api/v1/me/saved-jobs').pipe(
      tap({
        next: (jobs) => {
          this.savedJobs.set(jobs);
          const idSet = new Set(jobs.map((j) => j.id.toLowerCase()));
          this.savedJobIds.set(idSet);
          this.loadingSavedJobs.set(false);
        },
        error: () => this.loadingSavedJobs.set(false)
      })
    );
  }

  loadSavedJobIds(): Observable<string[]> {
    return this.api.get<string[]>('/api/v1/me/saved-job-ids').pipe(
      tap((ids) => {
        this.savedJobIds.set(new Set(ids.map((id) => id.toLowerCase())));
      })
    );
  }

  isJobSaved(jobId: string): boolean {
    return this.savedJobIds().has(jobId.toLowerCase());
  }

  isJobApplied(jobId: string): boolean {
    if (!jobId) return false;
    const idLower = jobId.toLowerCase();
    return this.applications().some((a) => {
      const status = a.status ?? a.currentStatus;
      return a.jobId.toLowerCase() === idLower && status !== ApplicationStatus.Withdrawn;
    });
  }

  toggleSaveJob(jobId: string): Observable<{ isSaved: boolean }> {
    return this.api.post<{ isSaved: boolean }>(`/api/v1/jobs/${jobId}/save`, {}).pipe(
      tap((res) => {
        const idLower = jobId.toLowerCase();
        const currentIds = new Set(this.savedJobIds());
        if (res.isSaved) {
          currentIds.add(idLower);
        } else {
          currentIds.delete(idLower);
          this.savedJobs.set(this.savedJobs().filter((j) => j.id.toLowerCase() !== idLower));
        }
        this.savedJobIds.set(currentIds);
      })
    );
  }

  applyForJob(jobId: string, request: ApplyJobRequest): Observable<ApplicationDto> {
    return this.api.post<ApplicationDto>(`/api/v1/jobs/${jobId}/apply`, request).pipe(
      tap((newApp) => {
        this.applications.set([newApp, ...this.applications()]);
      })
    );
  }

  withdrawApplication(applicationId: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/me/applications/${applicationId}`).pipe(
      tap(() => {
        this.applications.set(
          this.applications().map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: ApplicationStatus.Withdrawn,
                  currentStatus: ApplicationStatus.Withdrawn,
                  statusHistory: [
                    ...app.statusHistory,
                    {
                      id: 'local-' + Date.now(),
                      toStatus: ApplicationStatus.Withdrawn,
                      status: ApplicationStatus.Withdrawn,
                      note: 'Application withdrawn by candidate.',
                      notes: 'Application withdrawn by candidate.',
                      changedAtUtc: new Date().toISOString(),
                      createdAtUtc: new Date().toISOString()
                    }
                  ]
                }
              : app
          )
        );
      })
    );
  }
}
