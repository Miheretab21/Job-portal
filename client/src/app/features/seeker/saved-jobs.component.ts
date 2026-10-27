import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeekerService } from '../../core/services/seeker.service';
import { JobService } from '../../core/services/job.service';
import { JobCardComponent } from '../jobs/job-card.component';

@Component({
  selector: 'app-saved-jobs',
  standalone: true,
  imports: [CommonModule, JobCardComponent],
  template: `
    <div class="saved-container">
      <div class="saved-header">
        <div>
          <div class="saved-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Candidate Saved Roles</span>
          </div>
          <h2 class="saved-title">Bookmarked Positions</h2>
          <p class="saved-subtitle">
            Keep track of roles you're interested in and apply whenever you're ready.
          </p>
        </div>

        <div class="header-right-actions">
          <div class="count-pill">
            <span class="count-val">{{ seekerService.savedJobs().length }}</span>
            <span class="count-text">Saved</span>
          </div>
        </div>
      </div>

      <!-- Urgent Deadline Alert Banner (if deadlines < 7 days) -->
      @if (urgentDeadlineCount() > 0) {
        <div class="urgent-deadline-banner animate-fade-in">
          <div class="urgent-banner-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="urgent-banner-content">
            <div class="urgent-banner-top">
              <span class="urgent-banner-title">Upcoming Application Deadlines</span>
              @if (firstUrgentJob(); as urgentJob) {
                <button type="button" class="btn-banner-view" (click)="scrollToJob(urgentJob.id)">
                  <span>View Role</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              }
            </div>
            <span class="urgent-banner-desc">
              You have <strong>{{ urgentDeadlineCount() }} saved {{ urgentDeadlineCount() === 1 ? 'position' : 'positions' }}</strong> closing within the next 7 days. Complete your application before the window closes.
            </span>
          </div>
        </div>
      }

      <!-- Sort Controls Bar -->
      @if (seekerService.savedJobs().length > 0) {
        <div class="saved-toolbar glass-panel">
          <div class="toolbar-stats">
            <span>Showing {{ sortedSavedJobs().length }} saved roles</span>
          </div>

          <div class="sort-selector-wrap">
            <label for="sortSaved" class="sort-label">Sort by:</label>
            <select 
              id="sortSaved"
              class="sort-dropdown" 
              [value]="sortBy()" 
              (change)="onSortChange($event)">
              <option value="deadline">Deadline (Soonest First)</option>
              <option value="recent">Recently Saved</option>
              <option value="salary">Highest Compensation</option>
            </select>
          </div>
        </div>
      }

      @if (seekerService.loadingSavedJobs()) {
        <div class="loading-box">
          <div class="spinner"></div>
          <span>Loading bookmarked jobs...</span>
        </div>
      } @else if (seekerService.savedJobs().length === 0) {
        <div class="empty-state glass-panel">
          <div class="empty-icon-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>No saved roles yet</h3>
          <p>Click the bookmark icon on any job card to save interesting opportunities across Ethiopia for later.</p>
          <button class="btn btn-primary mt-3" (click)="exploreJobs.emit()">
            Explore Available Roles
          </button>
        </div>
      } @else {
        <div class="saved-grid">
          @for (job of sortedSavedJobs(); track job.id) {
            <div class="saved-item-wrapper" [id]="'saved-job-' + job.id">
              <app-job-card 
                [job]="job" 
                [isSavedView]="true"
                (selectJob)="selectJob.emit($event)">
              </app-job-card>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .saved-container {
      max-width: 1040px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 5rem;
    }
    .saved-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .saved-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.8rem;
      border-radius: var(--radius-full);
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent-indigo);
      margin-bottom: 0.75rem;
      font-family: var(--font-mono);
      letter-spacing: 0.04em;
    }
    .saved-title {
      font-size: 2.15rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: var(--text-primary);
    }
    .saved-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 0.4rem;
      max-width: 580px;
      line-height: 1.55;
    }
    .header-right-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .count-pill {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      padding: 0.65rem 1.25rem;
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-sm);
    }
    .count-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--accent-cyan);
      font-family: var(--font-mono);
    }
    .count-text {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Urgent Deadline Banner */
    .urgent-deadline-banner {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.1rem 1.4rem;
      border-radius: var(--radius-lg);
      background: linear-gradient(90deg, rgba(244, 63, 94, 0.14) 0%, rgba(234, 179, 8, 0.08) 100%);
      border: 1px solid rgba(244, 63, 94, 0.35);
      margin-bottom: 1.75rem;
    }
    .urgent-banner-icon {
      color: #fb7185;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .urgent-banner-content {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
    }
    .urgent-banner-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .urgent-banner-title {
      font-size: 0.885rem;
      font-weight: 700;
      color: #fb7185;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .btn-banner-view {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(244, 63, 94, 0.2);
      border: 1px solid rgba(244, 63, 94, 0.45);
      color: #fb7185;
      padding: 0.3rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.775rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-banner-view:hover {
      background: #f43f5e;
      color: #fff;
      transform: translateX(2px);
    }
    .urgent-banner-desc {
      font-size: 0.875rem;
      color: var(--text-primary);
      line-height: 1.45;
    }

    /* Saved Toolbar */
    .saved-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-lg);
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
    }
    .toolbar-stats {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .sort-selector-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .sort-label {
      font-size: 0.825rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .sort-dropdown {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: all var(--transition-fast);
    }
    .sort-dropdown:hover, .sort-dropdown:focus {
      border-color: var(--accent-primary);
    }

    .saved-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .saved-item-wrapper {
      transition: all 0.3s ease;
      border-radius: var(--radius-xl);
    }
    .highlight-pulse {
      animation: highlightPulse 2s ease-in-out;
      outline: 2px solid var(--accent-rose);
      outline-offset: 4px;
    }

    .loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 0;
      gap: 1rem;
      color: var(--text-secondary);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-card);
      border-top-color: var(--accent-indigo);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      border-radius: var(--radius-xl);
      background: var(--bg-card);
      border: 1px solid var(--border-card);
    }
    .empty-icon-box {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-indigo);
      margin-bottom: 1rem;
    }

    @keyframes highlightPulse {
      0% { transform: scale(1); box-shadow: 0 0 0 rgba(244, 63, 94, 0); }
      30% { transform: scale(1.02); box-shadow: 0 0 30px rgba(244, 63, 94, 0.4); }
      70% { transform: scale(1.01); box-shadow: 0 0 20px rgba(244, 63, 94, 0.25); }
      100% { transform: scale(1); box-shadow: 0 0 0 rgba(244, 63, 94, 0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SavedJobsComponent {
  public readonly seekerService = inject(SeekerService);
  public readonly jobService = inject(JobService);

  public readonly selectJob = output<string>();
  public readonly exploreJobs = output<void>();

  public readonly sortBy = signal<'deadline' | 'recent' | 'salary'>('deadline');

  public readonly urgentDeadlineCount = computed(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return this.seekerService.savedJobs().filter((j) => {
      if (!j.deadlineUtc) return false;
      const diff = new Date(j.deadlineUtc).getTime() - now;
      return diff > 0 && diff <= sevenDaysMs;
    }).length;
  });

  public readonly firstUrgentJob = computed(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return this.seekerService.savedJobs().find((j) => {
      if (!j.deadlineUtc) return false;
      const diff = new Date(j.deadlineUtc).getTime() - now;
      return diff > 0 && diff <= sevenDaysMs;
    });
  });

  public readonly sortedSavedJobs = computed(() => {
    const list = [...this.seekerService.savedJobs()];
    const sort = this.sortBy();

    if (sort === 'deadline') {
      return list.sort((a, b) => {
        if (!a.deadlineUtc) return 1;
        if (!b.deadlineUtc) return -1;
        return new Date(a.deadlineUtc).getTime() - new Date(b.deadlineUtc).getTime();
      });
    }

    if (sort === 'recent') {
      return list.sort((a, b) => {
        return new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
      });
    }

    if (sort === 'salary') {
      return list.sort((a, b) => {
        const salA = a.salaryMax ?? a.salaryMin ?? 0;
        const salB = b.salaryMax ?? b.salaryMin ?? 0;
        return salB - salA;
      });
    }

    return list;
  });

  onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'deadline' | 'recent' | 'salary';
    this.sortBy.set(val);
  }

  scrollToJob(jobId: string): void {
    const el = document.getElementById(`saved-job-${jobId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-pulse');
      setTimeout(() => el.classList.remove('highlight-pulse'), 2200);
    }
  }
}
