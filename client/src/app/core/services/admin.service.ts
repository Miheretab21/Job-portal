import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { 
  PlatformAnalytics, 
  AdminJob, 
  AdminUser, 
  CreateCategoryRequest,
  TopCategoryMetric 
} from '../models/admin.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationService);

  // Reactive state signals
  public readonly analytics = signal<PlatformAnalytics | null>(null);
  public readonly jobs = signal<AdminJob[]>([]);
  public readonly users = signal<AdminUser[]>([]);

  public readonly loadingAnalytics = signal<boolean>(false);
  public readonly loadingJobs = signal<boolean>(false);
  public readonly loadingUsers = signal<boolean>(false);

  loadAnalytics(): Observable<PlatformAnalytics> {
    this.loadingAnalytics.set(true);
    return this.api.get<PlatformAnalytics>('/api/v1/admin/analytics').pipe(
      tap({
        next: (data) => {
          this.analytics.set(data);
          this.loadingAnalytics.set(false);
        },
        error: () => this.loadingAnalytics.set(false)
      })
    );
  }

  loadJobs(status?: number): Observable<AdminJob[]> {
    this.loadingJobs.set(true);
    const params: Record<string, any> = {};
    if (status !== undefined && status !== null) {
      params['status'] = status;
    }

    return this.api.get<AdminJob[]>('/api/v1/admin/jobs', params).pipe(
      tap({
        next: (data) => {
          this.jobs.set(data);
          this.loadingJobs.set(false);
        },
        error: () => this.loadingJobs.set(false)
      })
    );
  }

  updateJobStatus(jobId: string, status: number): Observable<AdminJob> {
    return this.api.put<AdminJob>(`/api/v1/admin/jobs/${jobId}/status`, { status }).pipe(
      tap((updated) => {
        this.jobs.update((list) => list.map((j) => (j.id === jobId ? updated : j)));
        this.notifications.showToast(
          'Requisition Status Updated',
          `Job '${updated.title}' status changed to ${this.getStatusLabel(status)}.`,
          'info'
        );
      })
    );
  }

  deleteJob(jobId: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/admin/jobs/${jobId}`).pipe(
      tap(() => {
        this.jobs.update((list) => list.filter((j) => j.id !== jobId));
        this.notifications.showToast('Requisition Deleted', 'Job requisition removed by administrator.', 'warning');
      })
    );
  }

  loadUsers(role?: number, search?: string): Observable<AdminUser[]> {
    this.loadingUsers.set(true);
    const params: Record<string, any> = {};
    if (role) params['role'] = role;
    if (search) params['search'] = search;

    return this.api.get<AdminUser[]>('/api/v1/admin/users', params).pipe(
      tap({
        next: (data) => {
          this.users.set(data);
          this.loadingUsers.set(false);
        },
        error: () => this.loadingUsers.set(false)
      })
    );
  }

  toggleUserLock(userId: string): Observable<AdminUser> {
    return this.api.post<AdminUser>(`/api/v1/admin/users/${userId}/toggle-lock`, {}).pipe(
      tap((updated) => {
        this.users.update((list) => list.map((u) => (u.id === userId ? updated : u)));
        const stateStr = updated.isLocked ? 'locked (access suspended)' : 'unlocked (access restored)';
        this.notifications.showToast(
          'Account Security State',
          `User account ${updated.email} is now ${stateStr}.`,
          updated.isLocked ? 'warning' : 'success'
        );
      })
    );
  }

  toggleCompanyVerification(companyId: string): Observable<{ isVerified: boolean }> {
    return this.api.post<{ isVerified: boolean }>(`/api/v1/admin/companies/${companyId}/verify`, {}).pipe(
      tap((res) => {
        this.users.update((list) =>
          list.map((u) => (u.companyId === companyId ? { ...u, isCompanyVerified: res.isVerified } : u))
        );
        this.notifications.showToast(
          'Company Verification Updated',
          `Organization verification status is now ${res.isVerified ? 'Verified' : 'Unverified / Pending'}.`,
          res.isVerified ? 'success' : 'info'
        );
      })
    );
  }

  createCategory(request: CreateCategoryRequest): Observable<TopCategoryMetric> {
    return this.api.post<TopCategoryMetric>('/api/v1/admin/categories', request).pipe(
      tap((newCat) => {
        if (this.analytics()) {
          this.analytics.update((a) => {
            if (!a) return a;
            return {
              ...a,
              totalCategories: a.totalCategories + 1,
              topCategories: [newCat, ...a.topCategories]
            };
          });
        }
        this.notifications.showToast('Category Created', `Category '${newCat.name}' has been added to taxonomy.`, 'success');
      })
    );
  }

  deleteCategory(categoryId: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/admin/categories/${categoryId}`).pipe(
      tap(() => {
        if (this.analytics()) {
          this.analytics.update((a) => {
            if (!a) return a;
            return {
              ...a,
              totalCategories: Math.max(0, a.totalCategories - 1),
              topCategories: a.topCategories.filter((c) => c.id !== categoryId)
            };
          });
        }
        this.notifications.showToast('Category Removed', 'Category removed from platform taxonomy.', 'info');
      })
    );
  }

  private getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Draft';
      case 2: return 'Published';
      case 3: return 'Archived';
      case 4: return 'Closed';
      default: return 'Active';
    }
  }
}
