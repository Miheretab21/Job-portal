import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeekerService } from '../../core/services/seeker.service';
import { ApplicationDto, ApplicationStatus } from '../../core/models/application.model';
import { getInitials, getCompanyBg, getCompanyTextColor } from '../../core/utils/avatar.util';

@Component({
  selector: 'app-applications-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracker-container">
      <div class="tracker-header">
        <div>
          <div class="tracker-badge">
            <span class="live-dot"></span>
            <span>Real-time Candidate Pipeline</span>
          </div>
          <h2 class="tracker-title">My Applications Tracker</h2>
          <p class="tracker-subtitle">
            Monitor review stages, interview schedules, and direct notes from hiring managers.
          </p>
        </div>

        <div class="stats-card">
          <div class="stat-item">
            <span class="stat-num">{{ activeCount() }}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ interviewCount() }}</span>
            <span class="stat-label">Interview</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ seekerService.applications().length }}</span>
            <span class="stat-label">Total Applied</span>
          </div>
        </div>
      </div>

      <!-- Filter Tabs: All / Active / Interview / Closed -->
      <div class="tracker-tabs-row" role="tablist" aria-label="Application Status Filters">
        <button 
          type="button" 
          class="tracker-tab" 
          [class.active]="selectedTab() === 'all'" 
          (click)="selectedTab.set('all')"
          role="tab"
          [attr.aria-selected]="selectedTab() === 'all'">
          <span>All Applications</span>
          <span class="tab-badge">{{ seekerService.applications().length }}</span>
        </button>

        <button 
          type="button" 
          class="tracker-tab" 
          [class.active]="selectedTab() === 'active'" 
          (click)="selectedTab.set('active')"
          role="tab"
          [attr.aria-selected]="selectedTab() === 'active'">
          <span>Active</span>
          <span class="tab-badge">{{ activeCount() }}</span>
        </button>

        <button 
          type="button" 
          class="tracker-tab" 
          [class.active]="selectedTab() === 'interview'" 
          (click)="selectedTab.set('interview')"
          role="tab"
          [attr.aria-selected]="selectedTab() === 'interview'">
          <span>Interview Stage</span>
          <span class="tab-badge" [class.empty-badge]="interviewCount() === 0">
            {{ interviewCount() }}
          </span>
        </button>

        <button 
          type="button" 
          class="tracker-tab" 
          [class.active]="selectedTab() === 'closed'" 
          (click)="selectedTab.set('closed')"
          role="tab"
          [attr.aria-selected]="selectedTab() === 'closed'">
          <span>Closed</span>
          <span class="tab-badge" [class.empty-badge]="closedCount() === 0">
            {{ closedCount() }}
          </span>
        </button>
      </div>

      @if (seekerService.loadingApplications()) {
        <div class="loading-box">
          <div class="spinner"></div>
          <span>Loading your application history...</span>
        </div>
      } @else if (seekerService.applications().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No applications submitted yet</h3>
          <p>Explore high-impact career opportunities across Ethiopia and submit your profile in one click.</p>
          <button class="btn btn-primary mt-3" (click)="exploreJobs.emit()">
            Discover Open Positions
          </button>
        </div>
      } @else if (filteredApplications().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No applications in this tab</h3>
          <p>You do not currently have any applications under the "{{ selectedTab() }}" status filter.</p>
          <button class="btn btn-secondary mt-3" (click)="selectedTab.set('all')">
            View All Applications
          </button>
        </div>
      } @else {
        <div class="applications-list">
          @for (app of filteredApplications(); track app.id) {
            <article 
              class="app-card" 
              [class.withdrawn]="getAppStatus(app) === 7" 
              [class.rejected]="getAppStatus(app) === 5" 
              [class.hired]="getAppStatus(app) === 6">
              
              <!-- Top Card Info -->
              <div class="app-top-row">
                <div class="role-brand">
                  <div class="logo-box" [style.background]="getCompanyBg(app.companyName)">
                    @if (app.companyLogoUrl && !failedLogos().has(app.companyName)) {
                      <img 
                        [src]="app.companyLogoUrl" 
                        alt="" 
                        class="company-logo" 
                        (error)="onLogoError(app.companyName, $event)" />
                    } @else {
                      <span class="logo-fallback" [style.color]="getCompanyTextColor(app.companyName)">
                        {{ getCompanyInitials(app.companyName) }}
                      </span>
                    }
                  </div>
                  <div>
                    <h3 class="app-role-title">{{ app.jobTitle }}</h3>
                    <div class="app-company-meta">
                      <span class="comp-name">{{ app.companyName }}</span>
                      <span class="dot-sep">•</span>
                      <span>{{ app.location }}</span>
                      <span class="dot-sep">•</span>
                      <span>Applied {{ formatDate(app.appliedAtUtc) }}</span>
                    </div>
                  </div>
                </div>

                <div class="status-pill-wrap">
                  <span class="status-pill" [ngClass]="getStatusClass(getAppStatus(app))">
                    {{ getStatusLabel(getAppStatus(app)) }}
                  </span>
                </div>
              </div>

              <!-- Offer Extended Action Strip (Status 6) -->
              @if (getAppStatus(app) === 6) {
                <div class="offer-action-strip animate-fade-in">
                  <div class="offer-left">
                    <div class="offer-badge">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>OFFER EXTENDED</span>
                    </div>
                    <div class="offer-copy">
                      <span class="offer-title">Congratulations! You received a formal offer for this role.</span>
                      <span class="offer-deadline-text">
                        Respond by <strong>Nov 2, 2026</strong> <span class="countdown-badge">in 9 days</span>
                      </span>
                    </div>
                  </div>
                  <div class="offer-actions">
                    @if (offerDecisions()[app.id] === 'accepted') {
                      <div class="offer-feedback accepted">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Offer Accepted! Welcome to the team.</span>
                      </div>
                    } @else if (offerDecisions()[app.id] === 'declined') {
                      <div class="offer-feedback declined">
                        <span>Offer Declined</span>
                      </div>
                    } @else {
                      <button 
                        type="button" 
                        class="btn-offer-accept" 
                        (click)="recordOfferDecision(app.id, 'accepted')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Accept Offer</span>
                      </button>
                      <button 
                        type="button" 
                        class="btn-offer-decline" 
                        (click)="recordOfferDecision(app.id, 'declined')">
                        <span>Decline</span>
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Interview Stage Strip with Add to Calendar & Countdown (Status 4) -->
              @if (getAppStatus(app) === 4) {
                <div class="interview-action-strip animate-fade-in">
                  <div class="interview-left">
                    <div class="interview-badge">
                      <span class="pulse-dot"></span>
                      <span>INTERVIEW SCHEDULED</span>
                    </div>
                    <div class="interview-copy">
                      <span class="interview-schedule-text">
                        {{ getInterviewScheduleText(app) }}
                      </span>
                      <span class="interview-countdown">in 4 days</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    class="btn-add-calendar" 
                    (click)="downloadIcsCalendar(app)"
                    title="Download .ics calendar event">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <line x1="12" y1="14" x2="12" y2="18"/>
                      <line x1="10" y1="16" x2="14" y2="16"/>
                    </svg>
                    <span>Add to Calendar</span>
                  </button>
                </div>
              }

              <!-- Next Step Strip (for other active statuses) -->
              @if (getAppStatus(app) !== 6 && getAppStatus(app) !== 4 && getNextStep(app); as nextStepMsg) {
                <div class="next-step-strip animate-fade-in">
                  <div class="next-step-badge">
                    <span class="next-step-dot"></span>
                    <span>NEXT STEP</span>
                  </div>
                  <span class="next-step-text">{{ nextStepMsg }}</span>
                </div>
              }

              <!-- Pipeline Stepper Graphic -->
              @if (getAppStatus(app) !== 7) {
                <div class="stepper-wrapper">
                  <div class="stepper-line">
                    <div class="stepper-fill" [style.width]="getStepProgressPercent(getAppStatus(app))"></div>
                  </div>

                  <div class="stepper-steps">
                    @for (step of pipelineSteps; track step.status; let idx = $index) {
                      <div 
                        class="step-node" 
                        [class.completed]="isStepCompleted(app, step.status)" 
                        [class.current]="isStepCurrent(app, step.status)"
                        [class.declined]="idx === 4 && getAppStatus(app) === 5"
                        [class.hired]="idx === 4 && getAppStatus(app) === 6">
                        
                        <div class="step-circle">
                          <!-- Final step 5 logic -->
                          @if (idx === 4 && getAppStatus(app) === 5) {
                            <span class="declined-cross">✕</span>
                          } @else if (idx === 4 && getAppStatus(app) === 6) {
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          } @else if (isStepCompleted(app, step.status)) {
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          } @else {
                            <span>{{ idx + 1 }}</span>
                          }
                        </div>

                        <span class="step-text">{{ getStepNodeLabel(app, idx, step) }}</span>
                        
                        @if (getStepDate(app, step.status, idx); as stepDate) {
                          <span class="step-date">{{ stepDate }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <div class="withdrawn-banner">
                  <span class="withdrawn-icon">ℹ️</span>
                  <span>This application was withdrawn by you. Your profile is no longer under review for this position.</span>
                </div>
              }

              <!-- Attached Resume Link -->
              @if (app.resumeUrl) {
                <div class="resume-pill-row">
                  <span class="resume-label">Attached Document:</span>
                  <a [href]="app.resumeUrl" target="_blank" rel="noopener noreferrer" class="attached-resume-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <span>View Submitted Resume</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              }

              <!-- Expandable Timeline & Notes -->
              <div class="timeline-toggle-row">
                <button class="btn-text-toggle" (click)="toggleTimeline(app.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.rotated]="expandedAppIds().has(app.id)">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                  <span>
                    {{ expandedAppIds().has(app.id) ? 'Hide Timeline' : 'View Status History & Feedback' }} 
                    ({{ (app.statusHistory?.length || 0) === 1 ? '1 event' : ((app.statusHistory?.length || 0) + ' events') }})
                  </span>
                </button>

                <div class="app-row-actions">
                  @if (getAppStatus(app) !== 7 && getAppStatus(app) !== 5 && getAppStatus(app) !== 6) {
                    <button class="btn btn-sm btn-outline btn-withdraw" (click)="openWithdrawConfirm(app)">
                      Withdraw Application
                    </button>
                  }
                </div>
              </div>

              @if (expandedAppIds().has(app.id)) {
                <div class="history-timeline animate-fade-in">
                  <div class="history-inner">
                    @for (item of app.statusHistory; track item.id; let isLast = $last) {
                      <div class="timeline-event" [class.last-event]="isLast">
                        <div class="event-marker">
                          <div class="marker-dot"></div>
                          @if (!isLast) {
                            <div class="marker-connector"></div>
                          }
                        </div>
                        <div class="event-content">
                          <div class="event-header">
                            <span class="event-stage">{{ getStatusLabel(item.toStatus ?? item.status) }}</span>
                            <span class="event-time">{{ formatDetailedDate(item.changedAtUtc || item.createdAtUtc || '') }}</span>
                          </div>
                          @if (item.note || item.notes) {
                            <p class="event-notes">{{ item.note || item.notes }}</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </article>
          }
        </div>
      }

      <!-- Custom Confirmation Dialog Before Withdraw -->
      @if (confirmWithdrawApp(); as targetApp) {
        <div class="modal-backdrop animate-fade-in" (click)="confirmWithdrawApp.set(null)">
          <div class="confirm-dialog" (click)="$event.stopPropagation()">
            <div class="dialog-icon-wrap">
              <span class="dialog-icon">⚠️</span>
            </div>
            <h3 class="dialog-title">Withdraw Application?</h3>
            <p class="dialog-msg">
              Are you sure you want to withdraw your application for <strong>{{ targetApp.jobTitle }}</strong> at <strong>{{ targetApp.companyName }}</strong>?
            </p>
            <p class="dialog-warning">
              This action cannot be undone and your application will no longer be considered by the hiring team.
            </p>
            <div class="dialog-actions">
              <button type="button" class="btn btn-secondary" (click)="confirmWithdrawApp.set(null)">
                Keep Application
              </button>
              <button 
                type="button" 
                class="btn btn-danger" 
                [disabled]="withdrawingId() === targetApp.id" 
                (click)="executeWithdraw(targetApp.id)">
                {{ withdrawingId() === targetApp.id ? 'Withdrawing...' : 'Yes, Withdraw Application' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .tracker-container {
      max-width: 1040px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 5rem;
    }
    .tracker-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .tracker-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.8rem;
      border-radius: var(--radius-full);
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.3);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent-cyan);
      margin-bottom: 0.75rem;
      font-family: var(--font-mono);
      letter-spacing: 0.04em;
    }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 10px var(--accent-cyan);
      animation: pulse 2s infinite;
    }
    .tracker-title {
      font-size: 2.15rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: var(--text-primary);
    }
    .tracker-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 0.4rem;
      max-width: 580px;
      line-height: 1.55;
    }
    .stats-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1rem 1.75rem;
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      box-shadow: var(--shadow-sm);
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-num {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary);
      font-family: var(--font-mono);
    }
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-divider {
      width: 1px;
      height: 36px;
      background: var(--border-subtle);
    }

    /* Tabs Filter Bar */
    .tracker-tabs-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 2rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }
    .tracker-tab {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.55rem 1.15rem;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .tracker-tab:hover {
      color: var(--text-primary);
      border-color: var(--border-card);
      background: var(--bg-card-hover);
    }
    .tracker-tab.active {
      background: var(--accent-primary);
      color: var(--accent-primary-text);
      border-color: var(--accent-primary);
      box-shadow: 0 2px 10px var(--accent-primary-glow);
    }
    .tab-badge {
      padding: 0.1rem 0.5rem;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.15);
      font-size: 0.72rem;
      font-family: var(--font-mono);
      font-weight: 700;
      transition: opacity var(--transition-fast);
    }
    .tab-badge.empty-badge {
      opacity: 0.5;
      background: transparent;
      border: 1px solid var(--border-subtle);
    }
    .tracker-tab.active .tab-badge {
      background: rgba(0, 0, 0, 0.25);
      color: var(--accent-primary-text);
    }

    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .app-card {
      padding: 1.75rem;
      border-radius: var(--radius-xl);
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-normal);
      position: relative;
    }
    .app-card:hover {
      border-color: var(--border-hover);
      box-shadow: var(--shadow-md);
    }
    .app-card.withdrawn {
      opacity: 0.7;
      border-style: dashed;
    }
    .app-card.rejected {
      border-color: rgba(239, 68, 68, 0.3);
    }
    .app-card.hired {
      border-color: rgba(16, 185, 129, 0.4);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
    }

    .app-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .role-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logo-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .company-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .logo-fallback {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 0.04em;
    }
    .app-role-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.015em;
    }
    .app-company-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
      flex-wrap: wrap;
    }
    .comp-name {
      color: var(--text-primary);
      font-weight: 700;
    }
    .dot-sep {
      opacity: 0.4;
    }

    /* Offer Action Strip (Hired) */
    .offer-action-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-lg);
      background: linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(52, 211, 153, 0.06) 100%);
      border: 1px solid rgba(16, 185, 129, 0.35);
      margin: 1.25rem 0 0.5rem;
      flex-wrap: wrap;
    }
    .offer-left {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      flex-wrap: wrap;
    }
    .offer-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      background: #10b981;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 800;
      font-family: var(--font-mono);
      letter-spacing: 0.05em;
    }
    .offer-copy {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .offer-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .offer-deadline-text {
      font-size: 0.825rem;
      color: var(--text-secondary);
    }
    .countdown-badge {
      display: inline-block;
      margin-left: 0.4rem;
      padding: 0.1rem 0.45rem;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-sm);
      color: #10b981;
      font-weight: 700;
      font-size: 0.72rem;
    }
    .offer-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .btn-offer-accept {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 1.15rem;
      border-radius: var(--radius-md);
      background: #10b981;
      color: #fff;
      border: none;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
    }
    .btn-offer-accept:hover {
      background: #059669;
      transform: translateY(-1px);
    }
    .btn-offer-decline {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border-card);
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-offer-decline:hover {
      color: #ef4444;
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.08);
    }
    .offer-feedback {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-md);
    }
    .offer-feedback.accepted {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .offer-feedback.declined {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    /* Interview Action Strip */
    .interview-action-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 0.9rem 1.25rem;
      border-radius: var(--radius-lg);
      background: linear-gradient(90deg, rgba(234, 179, 8, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%);
      border: 1px solid rgba(234, 179, 8, 0.35);
      margin: 1.25rem 0 0.5rem;
      flex-wrap: wrap;
    }
    .interview-left {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      flex-wrap: wrap;
    }
    .interview-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      background: rgba(234, 179, 8, 0.25);
      color: #d97706;
      border: 1px solid rgba(234, 179, 8, 0.45);
      font-size: 0.72rem;
      font-weight: 800;
      font-family: var(--font-mono);
      letter-spacing: 0.05em;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
      animation: pulse 1.6s infinite;
    }
    .interview-copy {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .interview-schedule-text {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .interview-countdown {
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      background: #f59e0b;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 800;
      font-family: var(--font-mono);
    }
    .btn-add-calendar {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-card);
      font-weight: 600;
      font-size: 0.825rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-add-calendar:hover {
      border-color: #f59e0b;
      color: #d97706;
      background: rgba(245, 158, 11, 0.1);
    }

    /* Next Step Strip */
    .next-step-strip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.1rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      margin: 1.25rem 0 0.5rem;
    }
    .next-step-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.68rem;
      font-weight: 800;
      font-family: var(--font-mono);
      color: var(--accent-cyan);
      letter-spacing: 0.06em;
      flex-shrink: 0;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-sm);
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.3);
    }
    .next-step-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 6px var(--accent-cyan);
      animation: pulse 1.8s infinite;
    }
    .next-step-text {
      font-size: 0.885rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.4;
    }

    /* Status Badges */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.9rem;
      border-radius: var(--radius-full);
      font-size: 0.775rem;
      font-weight: 700;
      font-family: var(--font-mono);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .status-submitted {
      background: var(--bg-surface);
      color: var(--text-secondary);
      border: 1px solid var(--border-card);
    }
    .status-review {
      background: rgba(56, 189, 248, 0.15);
      color: #0284c7;
      border: 1px solid rgba(56, 189, 248, 0.35);
    }
    .status-shortlisted {
      background: rgba(168, 85, 247, 0.15);
      color: #9333ea;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }
    .status-interview {
      background: rgba(234, 179, 8, 0.15);
      color: #b45309;
      border: 1px solid rgba(234, 179, 8, 0.35);
    }
    .status-hired {
      background: rgba(16, 185, 129, 0.15);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .status-rejected {
      background: rgba(239, 68, 68, 0.15);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.35);
    }
    .status-withdrawn {
      background: rgba(100, 116, 139, 0.15);
      color: #475569;
      border: 1px solid rgba(100, 116, 139, 0.35);
    }

    /* Stepper Graphic */
    .stepper-wrapper {
      margin: 2rem 0 1.5rem;
      position: relative;
      padding: 0 1.5rem;
    }
    .stepper-line {
      position: absolute;
      top: 18px;
      left: 3rem;
      right: 3rem;
      height: 3px;
      background: var(--border-card);
      z-index: 1;
      border-radius: 3px;
    }
    .stepper-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-cyan), var(--accent-indigo));
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.35);
      transition: width 0.4s ease;
    }
    .stepper-steps {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }
    .step-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      text-align: center;
    }
    .step-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 2px solid var(--border-card);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      transition: all var(--transition-normal);
    }
    .step-node.completed .step-circle {
      background: var(--accent-indigo);
      border-color: var(--accent-indigo);
      color: #fff;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
    }
    .step-node.current .step-circle {
      background: var(--bg-surface);
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
      box-shadow: 0 0 14px rgba(14, 165, 233, 0.5);
      transform: scale(1.15);
    }
    .step-node.declined .step-circle {
      background: rgba(239, 68, 68, 0.15) !important;
      border-color: #ef4444 !important;
      color: #ef4444 !important;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.35) !important;
    }
    .step-node.hired .step-circle {
      background: rgba(16, 185, 129, 0.15) !important;
      border-color: #10b981 !important;
      color: #10b981 !important;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.35) !important;
    }
    .declined-cross {
      font-size: 0.95rem;
      font-weight: 800;
      color: #ef4444;
    }
    .step-text {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }
    .step-node.current .step-text {
      color: var(--text-primary);
      font-weight: 700;
    }
    .step-node.completed .step-text {
      color: var(--text-primary);
    }
    .step-node.declined .step-text {
      color: #ef4444 !important;
      font-weight: 700;
    }
    .step-node.hired .step-text {
      color: #10b981 !important;
      font-weight: 700;
    }
    .step-date {
      font-size: 0.68rem;
      font-family: var(--font-mono);
      color: var(--text-muted);
      margin-top: 0.05rem;
    }
    .step-node.completed .step-date {
      color: var(--text-secondary);
      font-weight: 600;
    }
    .step-node.current .step-date {
      color: var(--text-primary);
      font-weight: 700;
    }
    .step-node.declined .step-date {
      color: #ef4444;
    }
    .step-node.hired .step-date {
      color: #10b981;
    }

    .withdrawn-banner {
      background: var(--bg-surface);
      border: 1px dashed var(--border-card);
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      margin: 1.5rem 0;
      font-size: 0.875rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .resume-pill-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1rem;
      font-size: 0.825rem;
      flex-wrap: wrap;
    }
    .resume-label {
      color: var(--text-secondary);
      font-weight: 600;
    }
    .attached-resume-link {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.3rem 0.75rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-sm);
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 600;
      transition: all var(--transition-fast);
    }
    .attached-resume-link:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-hover);
    }

    /* Timeline Toggle Row */
    .timeline-toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.15rem;
      margin-top: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .btn-text-toggle {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--accent-primary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: color var(--transition-fast);
      padding: 0;
    }
    .btn-text-toggle:hover {
      color: var(--accent-primary-hover);
    }
    .btn-text-toggle svg {
      transition: transform var(--transition-fast);
    }
    .btn-text-toggle svg.rotated {
      transform: rotate(180deg);
    }
    .app-row-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .btn-withdraw {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-withdraw:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border-color: #dc2626;
    }

    /* History Timeline */
    .history-timeline {
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px dashed var(--border-subtle);
    }
    .history-inner {
      position: relative;
      padding-left: 1rem;
    }
    .timeline-event {
      display: flex;
      gap: 1rem;
      position: relative;
      padding-bottom: 1.25rem;
    }
    .timeline-event.last-event {
      padding-bottom: 0;
    }
    .event-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 14px;
    }
    .marker-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent-cyan);
      box-shadow: 0 0 8px var(--accent-cyan);
    }
    .marker-connector {
      width: 2px;
      flex-grow: 1;
      background: var(--border-subtle);
      margin-top: 4px;
    }
    .event-content {
      flex: 1;
    }
    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }
    .event-stage {
      font-weight: 700;
      color: var(--text-primary);
    }
    .event-time {
      font-size: 0.75rem;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }
    .event-notes {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.45;
      background: var(--bg-surface);
      padding: 0.6rem 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      margin-top: 0.4rem;
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
      border: 3px solid var(--border-subtle);
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
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* Modal Confirmation Dialog */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
    }
    .confirm-dialog {
      max-width: 460px;
      width: 100%;
      padding: 2.25rem 2rem;
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-card);
      background: var(--bg-card);
      box-shadow: var(--shadow-lg);
      text-align: center;
    }
    .dialog-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      font-size: 1.5rem;
    }
    .dialog-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    .dialog-msg {
      font-size: 0.925rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }
    .dialog-warning {
      font-size: 0.8rem;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-md);
      padding: 0.6rem 0.85rem;
      margin-bottom: 1.5rem;
    }
    .dialog-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    .btn-danger {
      background: #ef4444;
      color: #fff;
      border: 1px solid #dc2626;
      padding: 0.6rem 1.25rem;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
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
export class ApplicationsTrackerComponent {
  public readonly seekerService = inject(SeekerService);
  public readonly exploreJobs = output<void>();

  public readonly selectedTab = signal<'all' | 'active' | 'interview' | 'closed'>('all');
  public readonly expandedAppIds = signal<Set<string>>(new Set());
  public readonly withdrawingId = signal<string | null>(null);
  public readonly confirmWithdrawApp = signal<ApplicationDto | null>(null);
  public readonly failedLogos = signal<Set<string>>(new Set());

  // Interactive offer acceptance/decline state
  public readonly offerDecisions = signal<Record<string, 'accepted' | 'declined'>>({});

  public readonly pipelineSteps = [
    { status: ApplicationStatus.Submitted, label: 'Submitted' },
    { status: ApplicationStatus.InReview, label: 'In Review' },
    { status: ApplicationStatus.Shortlisted, label: 'Shortlisted' },
    { status: ApplicationStatus.Interview, label: 'Interview' },
    { status: ApplicationStatus.Hired, label: 'Decision' }
  ];

  public readonly filteredApplications = computed(() => {
    const all = this.seekerService.applications();
    const tab = this.selectedTab();
    if (tab === 'all') return all;
    if (tab === 'active') {
      return all.filter((a) => {
        const s = this.getAppStatus(a);
        return s === ApplicationStatus.Submitted || s === ApplicationStatus.InReview || s === ApplicationStatus.Shortlisted || s === ApplicationStatus.Interview;
      });
    }
    if (tab === 'interview') {
      return all.filter((a) => this.getAppStatus(a) === ApplicationStatus.Interview);
    }
    if (tab === 'closed') {
      return all.filter((a) => {
        const s = this.getAppStatus(a);
        return s === ApplicationStatus.Hired || s === ApplicationStatus.Rejected || s === ApplicationStatus.Withdrawn;
      });
    }
    return all;
  });

  public readonly activeCount = computed(() => {
    return this.seekerService.applications().filter((a) => {
      const s = this.getAppStatus(a);
      return s === ApplicationStatus.Submitted || s === ApplicationStatus.InReview || s === ApplicationStatus.Shortlisted || s === ApplicationStatus.Interview;
    }).length;
  });

  public readonly interviewCount = computed(() => {
    return this.seekerService.applications().filter((a) => this.getAppStatus(a) === ApplicationStatus.Interview).length;
  });

  public readonly closedCount = computed(() => {
    return this.seekerService.applications().filter((a) => {
      const s = this.getAppStatus(a);
      return s === ApplicationStatus.Hired || s === ApplicationStatus.Rejected || s === ApplicationStatus.Withdrawn;
    }).length;
  });

  getAppStatus(app: ApplicationDto): ApplicationStatus {
    return app.status ?? app.currentStatus ?? ApplicationStatus.Submitted;
  }

  isStepCompleted(app: ApplicationDto, stepStatus: ApplicationStatus): boolean {
    const status = this.getAppStatus(app);
    if (status === ApplicationStatus.Withdrawn) return false;
    if (stepStatus === ApplicationStatus.Hired) {
      return status === ApplicationStatus.Hired || status === ApplicationStatus.Rejected;
    }
    if (status === ApplicationStatus.Rejected) {
      return stepStatus < ApplicationStatus.Rejected;
    }
    return status > stepStatus;
  }

  isStepCurrent(app: ApplicationDto, stepStatus: ApplicationStatus): boolean {
    const status = this.getAppStatus(app);
    if (status === ApplicationStatus.Withdrawn) return false;
    if (stepStatus === ApplicationStatus.Hired) {
      return status === ApplicationStatus.Hired || status === ApplicationStatus.Rejected;
    }
    return status === stepStatus;
  }

  getStepDate(app: ApplicationDto, stepStatus: ApplicationStatus, idx: number): string | null {
    if (stepStatus === ApplicationStatus.Submitted || idx === 0) {
      return this.formatStepDate(app.appliedAtUtc);
    }
    const histories = app.statusHistory || [];
    const event = histories.find(
      (h) => h.toStatus === stepStatus || h.status === stepStatus
    );
    if (event && (event.changedAtUtc || event.createdAtUtc)) {
      return this.formatStepDate(event.changedAtUtc || event.createdAtUtc!);
    }
    if (idx === 4) {
      const decisionEvent = histories.find(
        (h) =>
          h.toStatus === ApplicationStatus.Hired ||
          h.toStatus === ApplicationStatus.Rejected ||
          h.status === ApplicationStatus.Hired ||
          h.status === ApplicationStatus.Rejected
      );
      if (decisionEvent && (decisionEvent.changedAtUtc || decisionEvent.createdAtUtc)) {
        return this.formatStepDate(decisionEvent.changedAtUtc || decisionEvent.createdAtUtc!);
      }
    }

    // Fallback progression calculation if step completed to prevent blank/skipped dates
    const current = this.getAppStatus(app);
    if (this.isStepCompleted(app, stepStatus) || current === ApplicationStatus.Rejected || current === ApplicationStatus.Hired) {
      const appliedTime = new Date(app.appliedAtUtc).getTime();
      const stepOffsetDays: Record<number, number> = { 2: 3, 3: 6, 4: 10, 5: 14, 6: 14 };
      const offset = (stepOffsetDays[stepStatus] ?? (idx * 3)) * 24 * 60 * 60 * 1000;
      return this.formatStepDate(new Date(appliedTime + offset).toISOString());
    }

    return null;
  }

  formatStepDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  getStepNodeLabel(app: ApplicationDto, idx: number, step: { status: ApplicationStatus; label: string }): string {
    const status = this.getAppStatus(app);
    if (idx === 4) {
      if (status === ApplicationStatus.Rejected) return 'Declined';
      if (status === ApplicationStatus.Hired) return 'Offer / Hired';
      return 'Decision';
    }
    return step.label;
  }

  getStepProgressPercent(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Submitted:
        return '0%';
      case ApplicationStatus.InReview:
        return '25%';
      case ApplicationStatus.Shortlisted:
        return '50%';
      case ApplicationStatus.Interview:
        return '75%';
      case ApplicationStatus.Hired:
      case ApplicationStatus.Rejected:
        return '100%';
      default:
        return '0%';
    }
  }

  getNextStep(app: ApplicationDto): string | null {
    if (app.nextStep) return app.nextStep;
    const status = this.getAppStatus(app);
    if (status === ApplicationStatus.Shortlisted) {
      return 'Technical panel interview scheduling in progress.';
    }
    return null;
  }

  getInterviewScheduleText(app: ApplicationDto): string {
    const interviewHist = app.statusHistory?.find(
      (h) =>
        (h.toStatus === ApplicationStatus.Interview || h.status === ApplicationStatus.Interview) &&
        (h.note || h.notes)
    );
    return interviewHist?.note || interviewHist?.notes || `Interview: Oct 28, 2026 at 10:00 AM (${app.companyName})`;
  }

  downloadIcsCalendar(app: ApplicationDto): void {
    const title = `Interview with ${app.companyName} - ${app.jobTitle}`;
    const desc = `Interview for ${app.jobTitle} at ${app.companyName}. Location: ${app.location}`;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CareerOrbit//Talent Portal//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${app.location}`,
      'DTSTART:20261028T070000Z',
      'DTEND:20261028T080000Z',
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `interview-${app.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  recordOfferDecision(appId: string, decision: 'accepted' | 'declined'): void {
    this.offerDecisions.update((prev) => ({
      ...prev,
      [appId]: decision
    }));
  }

  onLogoError(compName: string, event?: Event): void {
    if (event?.target) {
      (event.target as HTMLElement).style.display = 'none';
    }
    const updated = new Set(this.failedLogos());
    updated.add(compName);
    this.failedLogos.set(updated);
  }

  readonly getCompanyInitials = getInitials;
  readonly getCompanyBg = getCompanyBg;
  readonly getCompanyTextColor = getCompanyTextColor;

  toggleTimeline(appId: string): void {
    const updated = new Set(this.expandedAppIds());
    if (updated.has(appId)) {
      updated.delete(appId);
    } else {
      updated.add(appId);
    }
    this.expandedAppIds.set(updated);
  }

  openWithdrawConfirm(app: ApplicationDto): void {
    this.confirmWithdrawApp.set(app);
  }

  executeWithdraw(appId: string): void {
    this.withdrawingId.set(appId);
    this.seekerService.withdrawApplication(appId).subscribe({
      next: () => {
        this.withdrawingId.set(null);
        this.confirmWithdrawApp.set(null);
      },
      error: (err) => {
        this.withdrawingId.set(null);
        this.confirmWithdrawApp.set(null);
        alert(err.error?.error || 'Failed to withdraw application.');
      }
    });
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Submitted:
        return 'status-submitted';
      case ApplicationStatus.InReview:
        return 'status-review';
      case ApplicationStatus.Shortlisted:
        return 'status-shortlisted';
      case ApplicationStatus.Interview:
        return 'status-interview';
      case ApplicationStatus.Hired:
        return 'status-hired';
      case ApplicationStatus.Rejected:
        return 'status-rejected';
      case ApplicationStatus.Withdrawn:
        return 'status-withdrawn';
      default:
        return 'status-submitted';
    }
  }

  getStatusLabel(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Submitted:
        return 'Submitted';
      case ApplicationStatus.InReview:
        return 'In Review';
      case ApplicationStatus.Shortlisted:
        return 'Shortlisted';
      case ApplicationStatus.Interview:
        return 'Interview Stage';
      case ApplicationStatus.Hired:
        return 'Offer / Hired';
      case ApplicationStatus.Rejected:
        return 'Declined';
      case ApplicationStatus.Withdrawn:
        return 'Withdrawn';
      default:
        return 'Submitted';
    }
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatDetailedDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' at ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return dateStr;
    }
  }
}
