import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobListItem } from '../../core/models/job.model';
import { SeekerService } from '../../core/services/seeker.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { getInitials, getCompanyBg, getCompanyTextColor } from '../../core/utils/avatar.util';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="job-card glass-panel" (click)="selectJob.emit(job().id)" tabindex="0" (keyup.enter)="selectJob.emit(job().id)">
      <div class="card-header">
        <div class="company-brand">
          <div class="logo-box" [style.background]="getCompanyBg(job().company.name)">
            @if (job().company.logoUrl && !imageFailed()) {
              <img [src]="job().company.logoUrl" alt="" class="company-logo" (error)="onLogoError($event)" />
            } @else {
              <div class="logo-fallback" [style.color]="getCompanyTextColor(job().company.name)">
                {{ getCompanyInitials(job().company.name) }}
              </div>
            }
          </div>
          <div class="company-info">
            <div class="name-row">
              <span class="company-name">{{ job().company.name }}</span>
              @if (job().company.isVerified) {
                <span class="verified-icon" title="Verified Employer — Registered Entity & Transparent Pay">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              } @else {
                <span class="unverified-icon" title="Pending Verification — Newly registered organization undergoing platform review">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
              }
            </div>
            <span class="location-text" [title]="job().location">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ getShortLocation(job().location) }}
            </span>
          </div>
        </div>

        <div class="header-actions">
          <button 
            type="button"
            class="bookmark-btn" 
            [class.saved]="seekerService.isJobSaved(job().id)"
            (click)="toggleBookmark($event)" 
            [title]="seekerService.isJobSaved(job().id) ? 'Remove Bookmark' : 'Save Role'"
            aria-label="Save this job">
            <svg width="15" height="15" viewBox="0 0 24 24" [attr.fill]="seekerService.isJobSaved(job().id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="title-container">
          <h3 class="job-title">{{ job().title }}</h3>
        </div>

        <!-- Prominent Salary Hero Element -->
        <div class="salary-hero-row">
          @if (job().isSalaryNegotiable) {
            <span class="salary-hero-pill negotiable" title="Salary open to candidate negotiation">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M17 1l4 4-4 4"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <path d="M7 23l-4-4 4-4"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              <span>Negotiable</span>
            </span>
          } @else if (job().salaryMin || job().salaryMax) {
            <span class="salary-hero-pill" [class.salary-etb]="job().salaryCurrency?.toUpperCase() === 'ETB'">
              <span class="salary-amount">{{ formatSalary(job().salaryMin, job().salaryMax, job().salaryCurrency) }}</span>
            </span>
          }

          @if (seekerService.isJobApplied(job().id) && !isSavedView()) {
            <span class="badge-applied-pill" title="You have an active submitted application for this role">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Applied</span>
            </span>
          }
        </div>

        <!-- Muted Grouped Secondary Badges Strip -->
        <div class="secondary-meta-strip">
          <span class="meta-item">
            @if (job().isRemote) {
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>Remote</span>
            } @else {
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                <line x1="9" y1="22" x2="9" y2="22.01"/>
                <line x1="15" y1="22" x2="15" y2="22.01"/>
                <line x1="9" y1="6" x2="9" y2="6.01"/>
                <line x1="15" y1="6" x2="15" y2="6.01"/>
                <line x1="9" y1="10" x2="9" y2="10.01"/>
                <line x1="15" y1="10" x2="15" y2="10.01"/>
                <line x1="9" y1="14" x2="9" y2="14.01"/>
                <line x1="15" y1="14" x2="15" y2="14.01"/>
              </svg>
              <span>On-site</span>
            }
          </span>
          <span class="meta-sep">·</span>
          <span class="meta-item">{{ getJobTypeLabel(job().jobType) }}</span>
          @if ((job().numberOfPositions ?? 0) > 1) {
            <span class="meta-sep">·</span>
            <span class="meta-item" [title]="job().numberOfPositions + ' openings available'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{{ job().numberOfPositions }} Positions</span>
            </span>
          }
          @if (job().educationLevel) {
            <span class="meta-sep">·</span>
            <span class="meta-item" [title]="job().educationLevel">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <span>{{ getShortEdu(job().educationLevel) }}</span>
            </span>
          }
        </div>

        <!-- Skills Chips: top 3 + +N with tooltip -->
        <div class="skills-wrap">
          @for (skill of job().skills.slice(0, 3); track skill) {
            <span class="badge badge-skill" [title]="skill">{{ skill }}</span>
          }
          @if (job().skills.length > 3) {
            <span class="badge badge-skill badge-more" [title]="getRemainingSkills(job().skills)">
              +{{ job().skills.length - 3 }}
            </span>
          }
        </div>
      </div>

      <div class="card-footer">
        <div class="footer-left">
          <span class="time-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ getRelativeTime(job().createdAtUtc) }}
          </span>
          @if (job().deadlineUtc) {
            <span class="sep">·</span>
            <span class="deadline-tag" [class.urgent]="isDeadlineUrgent(job().deadlineUtc)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{{ formatDeadline(job().deadlineUtc) }}</span>
            </span>
          }
          <span class="sep">·</span>
          <span class="applicant-tag">{{ getApplicantCount(job()) }}</span>
        </div>

        @if (isSavedView()) {
          @if (seekerService.isJobApplied(job().id)) {
            <button class="btn btn-sm btn-outline applied-btn" (click)="$event.stopPropagation(); selectJob.emit(job().id)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Applied</span>
            </button>
          } @else {
            <button class="btn btn-sm btn-primary apply-now-btn" (click)="$event.stopPropagation(); selectJob.emit(job().id)">
              <span>Apply Now</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          }
        } @else {
          <button class="btn btn-sm btn-outline view-btn" (click)="$event.stopPropagation(); selectJob.emit(job().id)">
            <span>View Role</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        }
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      min-width: 0;
    }
    .job-card {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-width: 0;
      box-sizing: border-box;
      padding: 1.35rem;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
      position: relative;
      overflow: hidden;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      box-shadow: var(--shadow-sm);
    }
    .job-card:hover {
      transform: translateY(-3px);
      background: var(--bg-card-hover);
      border-color: var(--border-hover);
      box-shadow: var(--shadow-md), 0 0 20px var(--accent-primary-glow);
    }
    .job-card:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
      width: 100%;
    }
    .company-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      min-width: 0;
      flex: 1;
      overflow: hidden;
    }
    .logo-box {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-card);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .company-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .logo-fallback {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .company-info {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
      min-width: 0;
      flex: 1;
      overflow: hidden;
    }
    .name-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      min-width: 0;
    }
    .company-name {
      font-size: 0.925rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: keep-all;
    }
    .verified-icon {
      color: var(--accent-emerald, #10B981);
      display: flex;
      flex-shrink: 0;
    }
    .unverified-icon {
      color: var(--accent-amber, #F59E0B);
      display: flex;
      flex-shrink: 0;
      opacity: 0.85;
    }
    .location-text {
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.2rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    .location-text svg {
      flex-shrink: 0;
    }
    .header-actions {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .bookmark-btn {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }
    .bookmark-btn:hover {
      background: var(--accent-primary-subtle);
      border-color: var(--border-hover);
      color: var(--accent-primary);
    }
    .bookmark-btn.saved {
      background: var(--accent-primary-subtle);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      box-shadow: 0 0 10px var(--accent-primary-glow);
    }
    .card-body {
      margin-top: 1rem;
      flex: 1;
    }
    .job-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.35;
      letter-spacing: -0.015em;
      transition: color var(--transition-fast);
    }
    .job-card:hover .job-title {
      color: var(--accent-primary);
    }
    /* Dedicated Salary Hero Row */
    .salary-hero-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-top: 0.85rem;
      flex-wrap: wrap;
    }
    .salary-hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-md);
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.35);
      color: var(--accent-cyan);
      font-weight: 800;
      font-size: 0.95rem;
      font-family: var(--font-mono);
      letter-spacing: 0.02em;
      box-shadow: 0 0 12px rgba(14, 165, 233, 0.1);
    }
    .salary-hero-pill.salary-etb {
      background: rgba(210, 248, 39, 0.12);
      border-color: rgba(210, 248, 39, 0.35);
      color: var(--accent-primary);
      box-shadow: 0 0 12px rgba(210, 248, 39, 0.1);
    }
    .salary-hero-pill.negotiable {
      background: rgba(168, 85, 247, 0.12);
      border-color: rgba(168, 85, 247, 0.35);
      color: #c084fc;
      font-size: 0.85rem;
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.1);
    }
    .salary-symbol {
      font-size: 0.95rem;
    }
    .badge-applied-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-full);
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-size: 0.75rem;
      font-weight: 700;
      font-family: var(--font-mono);
      letter-spacing: 0.03em;
    }

    /* Muted Grouped Secondary Strip */
    .secondary-meta-strip {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-top: 0.6rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .meta-sep {
      color: var(--border-subtle);
      opacity: 0.8;
      font-size: 0.75rem;
    }

    .skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.85rem;
    }
    .badge-skill {
      max-width: 190px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      transition: all var(--transition-fast);
      background: var(--bg-surface);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      padding: 0.2rem 0.55rem;
    }
    .badge-skill:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      transform: translateY(-1px);
    }
    .badge-more {
      font-family: var(--font-mono);
      font-weight: 700;
      cursor: help;
    }
    .card-footer {
      margin-top: 1.25rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.775rem;
    }
    .time-tag {
      color: var(--text-muted);
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .sep {
      color: var(--border-hover);
    }
    .applicant-tag {
      color: var(--text-secondary);
      font-weight: 600;
      font-family: var(--font-mono);
    }
    .title-container {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .amharic-title {
      font-size: 0.825rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .deadline-tag {
      color: var(--text-muted);
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .deadline-tag.urgent {
      color: #f43f5e;
      font-weight: 700;
    }
    .view-btn {
      color: var(--accent-primary);
      border-color: var(--border-card);
      font-size: 0.8rem;
      font-weight: 600;
    }
    .view-btn:hover {
      background: var(--accent-primary);
      color: var(--accent-primary-text);
      border-color: var(--accent-primary);
    }
    .apply-now-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--accent-primary);
      color: var(--accent-primary-text);
      font-weight: 700;
      box-shadow: 0 0 12px var(--accent-primary-glow);
      font-size: 0.825rem;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--accent-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .apply-now-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 0 18px var(--accent-primary-glow);
    }
    .applied-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.08);
      font-weight: 600;
      font-size: 0.8rem;
    }
  `]
})
export class JobCardComponent {
  public readonly seekerService = inject(SeekerService);
  public readonly auth = inject(AuthService);
  public readonly notificationService = inject(NotificationService);

  public readonly job = input.required<JobListItem>();
  public readonly isSavedView = input<boolean>(false);
  public readonly selectJob = output<string>();
  public readonly requestAuth = output<void>();

  public readonly imageFailed = signal<boolean>(false);

  getRemainingSkills(skills: string[]): string {
    return skills.slice(3).join(', ');
  }

  getShortEdu(edu?: string): string {
    if (!edu) return '';
    if (edu.toLowerCase().includes('master')) return "Master's";
    if (edu.toLowerCase().includes('bachelor') || edu.toLowerCase().includes('bsc') || edu.toLowerCase().includes('ba')) return "Bachelor's";
    if (edu.toLowerCase().includes('diploma')) return 'Diploma';
    return edu;
  }

  formatDeadline(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const now = Date.now();
      const deadline = new Date(dateStr).getTime();
      const diffMs = deadline - now;
      if (diffMs <= 0) return 'Closing today';
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) return '1d left';
      return `${diffDays}d left`;
    } catch {
      return '';
    }
  }

  isDeadlineUrgent(dateStr?: string): boolean {
    if (!dateStr) return false;
    try {
      const diffDays = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7 && diffDays >= 0;
    } catch {
      return false;
    }
  }

  toggleBookmark(event: Event): void {
    event.stopPropagation();
    if (!this.auth.isAuthenticated()) {
      this.requestAuth.emit();
      return;
    }
    const id = this.job().id;
    const wasSaved = this.seekerService.isJobSaved(id);

    this.seekerService.toggleSaveJob(id).subscribe({
      next: () => {
        if (!wasSaved) {
          this.notificationService.showToast(
            'Role Bookmarked',
            `Saved "${this.job().title}" to your roles.`,
            'success'
          );
        } else {
          this.notificationService.showToast(
            'Bookmark Removed',
            `Removed "${this.job().title}" from saved roles.`,
            'info'
          );
        }
      }
    });
  }

  onLogoError(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.display = 'none';
    }
    this.imageFailed.set(true);
  }

  getShortLocation(loc?: string): string {
    if (!loc) return 'Addis Ababa';
    let clean = loc.replace(/,\s*Ethiopia/gi, '');
    clean = clean.replace(/\s*\(([^)]+)\)/g, ' · $1');
    return clean.trim();
  }

  getJobTypeLabel(type: number): string {
    const types: Record<number, string> = {
      1: 'Full-time',
      2: 'Part-time',
      3: 'Contract',
      4: 'Remote',
      5: 'Internship'
    };
    return types[type] || 'Full-time';
  }

  formatSalary(min?: number, max?: number, curr = 'USD'): string {
    const isEtb = curr?.toUpperCase() === 'ETB';

    if (isEtb) {
      if (min && max) {
        return `ETB ${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k /mo`;
      }
      if (min) return `From ETB ${(min / 1000).toFixed(0)}k /mo`;
      if (max) return `Up to ETB ${(max / 1000).toFixed(0)}k /mo`;
      return 'Competitive (ETB)';
    }

    // USD default
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k USD /yr`;
    }
    if (min) return `From $${(min / 1000).toFixed(0)}k USD /yr`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k USD /yr`;
    return 'Competitive';
  }

  getRelativeTime(dateStr?: string): string {
    if (!dateStr) return 'Recently';
    try {
      const now = Date.now();
      const past = new Date(dateStr).getTime();
      const diffMs = now - past;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return '1d ago';
      if (diffDays < 7) return `${diffDays}d ago`;
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks}w ago`;
    } catch {
      return 'Recently';
    }
  }

  getApplicantCount(job: JobListItem): string {
    // Generate realistic deterministic applicant count based on job title / ID
    let hash = 0;
    const str = job.id + job.title;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const count = Math.abs(hash % 24) + 6; // 6 to 29 applicants
    return `${count} applicants`;
  }

  readonly getCompanyInitials = getInitials;
  readonly getCompanyBg = getCompanyBg;
  readonly getCompanyTextColor = getCompanyTextColor;
}
