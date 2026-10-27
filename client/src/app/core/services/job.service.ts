import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Category, JobDetail, JobFacets, JobFilter, JobListItem, PaginatedList } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly api = inject(ApiService);

  public readonly categories = signal<Category[]>([]);
  public readonly facets = signal<JobFacets | null>(null);
  public readonly jobs = signal<JobListItem[]>([]);
  public readonly selectedJob = signal<JobDetail | null>(null);
  public readonly totalCount = signal<number>(0);
  public readonly totalPages = signal<number>(1);
  public readonly currentPage = signal<number>(1);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadCategories(): void {
    this.api.get<Category[]>('/api/v1/categories').subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadFacets(): void {
    this.api.get<JobFacets>('/api/v1/jobs/facets').subscribe({
      next: (data) => this.facets.set(data),
      error: (err) => console.error('Failed to load job facets', err)
    });
  }

  loadJobs(filter: JobFilter = {}): void {
    this.loading.set(true);
    this.error.set(null);

    const queryParams: Record<string, any> = { ...filter };
    if (Array.isArray(filter.skills) && filter.skills.length > 0) {
      queryParams['skills'] = filter.skills.join(',');
    }
    if (Array.isArray(filter.experienceLevels) && filter.experienceLevels.length > 0) {
      queryParams['experienceLevels'] = filter.experienceLevels.join(',');
    }
    if (Array.isArray(filter.jobTypes) && filter.jobTypes.length > 0) {
      queryParams['jobTypes'] = filter.jobTypes.join(',');
    }

    this.api.get<PaginatedList<JobListItem>>('/api/v1/jobs', queryParams).subscribe({
      next: (data) => {
        this.jobs.set(data.items);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.currentPage.set(data.pageNumber);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load jobs. Please try again.');
        this.loading.set(false);
        console.error('Failed to load jobs', err);
      }
    });
  }

  selectJob(id: string): void {
    this.loading.set(true);
    this.api.get<JobDetail>(`/api/v1/jobs/${id}`).subscribe({
      next: (data) => {
        this.selectedJob.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Job details could not be loaded.');
        this.loading.set(false);
        console.error('Failed to load job details', err);
      }
    });
  }

  clearSelectedJob(): void {
    this.selectedJob.set(null);
  }
}
