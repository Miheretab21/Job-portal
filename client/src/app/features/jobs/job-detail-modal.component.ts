import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobDetail, JobListItem } from '../../core/models/job.model';
import { SeekerService } from '../../core/services/seeker.service';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { ResumeUploaderComponent } from '../seeker/resume-uploader.component';
import { getInitials } from '../../core/utils/avatar.util';

@Component({
  selector: 'app-job-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ResumeUploaderComponent],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div 
        #modalContainer
        class="modal-panel glass-panel-glow" 
        role="dialog" 
        aria-modal="true" 
        [attr.aria-label]="job().title"
        (click)="$event.stopPropagation()">
        
        <!-- Close Button -->
        <button 
          class="close-btn" 
          (click)="onClose()" 
          aria-label="Close modal (Press Escape)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        @if (job(); as j) {
          <div class="modal-header">
            <div class="company-row">
              <div class="logo-box">
                @if (j.company.logoUrl && !logoFailed()) {
                  <img [src]="j.company.logoUrl" alt="" class="company-logo" (error)="logoFailed.set(true)" />
                } @else {
                  <div class="logo-fallback">{{ getInitials(j.company.name) }}</div>
                }
              </div>
              <div class="header-titles">
                <h2 class="role-title">{{ j.title }}</h2>
                <div class="company-meta">
                  <span class="company-name">{{ j.company.name }}</span>
                  <span class="dot-separator">•</span>
                  <span>{{ j.location }}</span>
                  <span class="dot-separator">•</span>
                  <span class="views-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ j.viewsCount }} views
                  </span>
                </div>
              </div>
            </div>

            <!-- Header Action & Filter Strip: Keep only Mode, Type, Share, and Bookmark -->
            <div class="badge-strip">
              @if (j.isRemote) {
                <span class="badge badge-remote">Remote</span>
              } @else {
                <span class="badge badge-onsite">On-site</span>
              }
              <span class="badge badge-fulltime">{{ getJobTypeLabel(j.jobType) }}</span>

              <div class="header-actions-right">
                <!-- Share Button -->
                <button 
                  type="button" 
                  class="btn-action-pill"
                  (click)="shareRole(j)"
                  [title]="'Share job link: ' + shareUrl()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  <span>{{ shareCopied() ? 'Link Copied!' : 'Share' }}</span>
                </button>

                <!-- Bookmark Button -->
                <button 
                  type="button"
                  class="btn-action-pill" 
                  [class.saved]="seekerService.isJobSaved(j.id)"
                  (click)="toggleBookmark(j.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" [attr.fill]="seekerService.isJobSaved(j.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>{{ seekerService.isJobSaved(j.id) ? 'Saved' : 'Save Role' }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-content">
            <!-- Apply View or Job Details -->
            @if (isApplying()) {
              <div class="apply-box">
                @if (submitted()) {
                  <!-- Success State after submitting -->
                  <div class="submission-success-card animate-fade-in">
                    <div class="success-icon-orb">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h3 class="success-title">Application Submitted Successfully!</h3>
                    <p class="success-desc">
                      Your resume and credentials have been delivered directly to the recruiting team at 
                      <strong>{{ j.company.name }}</strong> for <strong>{{ j.title }}</strong>.
                    </p>
                    <div class="success-actions">
                      <button class="btn btn-secondary" (click)="onClose()">Close</button>
                      <button class="btn btn-primary" (click)="goToTracker.emit(); onClose()">
                        View in Application Tracker
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="apply-header-area">
                    <h3 class="section-title">Apply for {{ j.title }}</h3>
                    <p class="section-desc">Submit your application directly to {{ j.company.name }}. Start empty or paste your key highlights.</p>
                  </div>

                  @if (errorMessage()) {
                    <div class="error-banner">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span>{{ errorMessage() }}</span>
                    </div>
                  }

                  <div class="form-group">
                    <label class="form-label" for="applicantName">
                      Full Name <span class="required-star">*</span>
                    </label>
                    <input 
                      id="applicantName"
                      type="text" 
                      class="form-input" 
                      [class.input-error]="formSubmitted() && !applicantName.trim()"
                      [(ngModel)]="applicantName" 
                      placeholder="Alex Rivera" />
                    @if (formSubmitted() && !applicantName.trim()) {
                      <div class="inline-validation-error">Please provide your full legal name.</div>
                    }
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="applicantEmail">
                      Email Address <span class="required-star">*</span>
                    </label>
                    <input 
                      id="applicantEmail"
                      type="email" 
                      class="form-input" 
                      [class.input-error]="formSubmitted() && !isEmailValid(applicantEmail)"
                      [(ngModel)]="applicantEmail" 
                      placeholder="alex.rivera@example.com" />
                    @if (formSubmitted() && !isEmailValid(applicantEmail)) {
                      <div class="inline-validation-error">Please enter a valid email address.</div>
                    }
                  </div>

                  <div class="form-group">
                    <app-resume-uploader 
                      [(uploadedUrl)]="resumeUrl" 
                      [(originalFileName)]="resumeFileName" />
                    @if (formSubmitted() && !resumeUrl.trim()) {
                      <div class="inline-validation-error">Please upload a resume (PDF or DOCX) to continue.</div>
                    }
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="coverNote">
                      Cover Note / Relevant Highlights <span class="optional-tag">(Optional)</span>
                    </label>
                    <textarea 
                      id="coverNote"
                      class="form-input textarea-input" 
                      rows="4" 
                      [(ngModel)]="coverNote" 
                      placeholder="Start typing your personalized message, relevant experience, or availability..."></textarea>
                  </div>

                  <div class="apply-actions">
                    <button class="btn btn-secondary" (click)="isApplying.set(false)" [disabled]="submitting()">Back to Details</button>
                    <button class="btn btn-primary" (click)="submitApplication(j.id)" [disabled]="submitting()">
                      @if (submitting()) {
                        <span>Submitting Application...</span>
                      } @else {
                        <span>Submit Application</span>
                      }
                    </button>
                  </div>
                }
              </div>
            } @else {
              <!-- "At a Glance" Block: Structured 6-item Grid with SVG Line Icons -->
              <section class="at-a-glance-box">
                <h4 class="glance-heading">At a Glance</h4>
                <div class="glance-grid">
                  <!-- 1. Compensation -->
                  <div class="glance-card">
                    <div class="glance-icon-circle salary-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div class="glance-content">
                      <span class="glance-label">Compensation</span>
                      <span class="glance-value salary-highlight">
                        {{ formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency, j.isSalaryNegotiable) }}
                      </span>
                    </div>
                  </div>

                  <!-- 2. Education -->
                  <div class="glance-card">
                    <div class="glance-icon-circle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </div>
                    <div class="glance-content">
                      <span class="glance-label">Education</span>
                      <span class="glance-value">{{ j.educationLevel || "Bachelor's Degree" }}</span>
                    </div>
                  </div>

                  <!-- 3. Experience -->
                  <div class="glance-card">
                    <div class="glance-icon-circle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    </div>
                    <div class="glance-content">
                      <span class="glance-label">Experience</span>
                      <span class="glance-value">{{ j.yearsOfExperience || getExperienceLevelLabel(j.experienceLevel) }}</span>
                    </div>
                  </div>

                  <!-- 4. Languages -->
                  <div class="glance-card">
                    <div class="glance-icon-circle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div class="glance-content">
                      <span class="glance-label">Languages</span>
                      <span class="glance-value">{{ j.languageRequirements || 'English' }}</span>
                    </div>
                  </div>

                  <!-- 5. Openings -->
                  <div class="glance-card">
                    <div class="glance-icon-circle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div class="glance-content">
                      <span class="glance-label">Open Positions</span>
                      <span class="glance-value">{{ (j.numberOfPositions ?? 1) + (j.numberOfPositions === 1 ? ' Opening' : ' Openings') }}</span>
                    </div>
                  </div>

                  <!-- 6. Deadline: Red only if < 7 days -->
                  <div class="glance-card" [class.urgent-border]="isUrgentDeadline(j.deadlineUtc)">
                    <div class="glance-icon-circle" [class.urgent-icon]="isUrgentDeadline(j.deadlineUtc)">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div class="glance-content">
                      <span class="glance-label">Application Deadline</span>
                      <span class="glance-value" [class.urgent-text]="isUrgentDeadline(j.deadlineUtc)">
                        {{ formatDeadline(j.deadlineUtc) }}
                        @if (isUrgentDeadline(j.deadlineUtc)) {
                          <span class="urgent-sub-tag">Closing Soon</span>
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Description -->
              <section class="detail-section">
                <h4 class="section-heading">About The Role</h4>
                <p class="body-text">{{ j.description }}</p>
              </section>

              <!-- Requirements rendered as real bullet list -->
              @if (j.requirements) {
                <section class="detail-section">
                  <h4 class="section-heading">Key Requirements</h4>
                  <ul class="bullet-list">
                    @for (item of parseBulletList(j.requirements); track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                </section>
              }

              <!-- Benefits rendered as real bullet list without salary duplication -->
              @if (j.benefits) {
                <section class="detail-section">
                  <h4 class="section-heading">Benefits & Perks</h4>
                  <ul class="bullet-list">
                    @for (item of parseBenefits(j.benefits); track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                </section>
              }

              <!-- Skills -->
              <section class="detail-section">
                <h4 class="section-heading">Required Skills & Competencies</h4>
                <div class="skills-strip">
                  @for (s of j.skills; track s) {
                    <span class="badge badge-skill">{{ s }}</span>
                  }
                </div>
              </section>

              <!-- About The Employer Section -->
              <section class="detail-section employer-about-section">
                <h4 class="section-heading">About {{ j.company.name }}</h4>
                <div class="employer-card glass-panel">
                  <div class="employer-card-header">
                    <div>
                      <div class="employer-title-row">
                        <h5 class="employer-name">{{ j.company.name }}</h5>
                        @if (j.company.isVerified) {
                          <span class="verified-pill">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Verified Organization
                          </span>
                        } @else {
                          <span class="unverified-pill" title="This organization is newly registered and pending platform verification.">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            Pending Verification
                          </span>
                        }
                      </div>
                      <div class="employer-meta">
                        @if (j.company.industry) {
                          <span>{{ j.company.industry }}</span>
                          <span class="dot-separator">•</span>
                        }
                        @if (j.company.companySize) {
                          <span>{{ j.company.companySize }}</span>
                          <span class="dot-separator">•</span>
                        }
                        <span>{{ j.company.location || j.location }}</span>
                      </div>
                    </div>
                    @if (j.company.website) {
                      <a [href]="j.company.website" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline website-link">
                        <span>Visit Website</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    }
                  </div>
                  @if (j.company.description) {
                    <p class="employer-desc">
                      {{ j.company.description }}
                    </p>
                  } @else {
                    <p class="employer-desc employer-desc-muted">
                      No company overview provided yet.
                    </p>
                  }
                </div>
              </section>

              <!-- Similar Roles Section -->
              @if (similarRoles().length > 0) {
                <section class="detail-section">
                  <h4 class="section-heading">Similar Roles You Might Like</h4>
                  <div class="similar-roles-grid">
                    @for (sim of similarRoles(); track sim.id) {
                      <div class="similar-card" (click)="openSimilarRole(sim.id)">
                        <div class="similar-top">
                          <span class="similar-comp">{{ sim.company.name }}</span>
                          <span class="similar-loc">{{ sim.location }}</span>
                        </div>
                        <h5 class="similar-title">{{ sim.title }}</h5>
                        <div class="similar-bottom">
                          <span class="similar-salary">
                            {{ formatSalary(sim.salaryMin, sim.salaryMax, sim.salaryCurrency, sim.isSalaryNegotiable) }}
                          </span>
                          <span class="similar-link">View Role →</span>
                        </div>
                      </div>
                    }
                  </div>
                </section>
              }

              <!-- Action Bar -->
              <div class="modal-footer">
                <button class="btn btn-outline" (click)="onClose()">Close</button>
                @if (seekerService.isJobApplied(j.id)) {
                  <button class="btn btn-outline applied-indicator-btn" (click)="goToTracker.emit(); onClose()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Already Applied · Track Status</span>
                  </button>
                } @else {
                  <button class="btn btn-primary btn-apply" (click)="startApplying()">
                    Apply for this Role
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }
    .modal-panel {
      width: 100%;
      max-width: 820px;
      max-height: 90vh;
      overflow-y: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 2.25rem;
      position: relative;
      color: var(--text-primary);
      box-shadow: var(--shadow-lg);
    }
    .close-btn {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      z-index: 10;
    }
    .close-btn:hover {
      background: var(--border-subtle);
      color: var(--text-primary);
    }
    .company-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .header-titles {
      flex: 1;
    }
    .logo-box {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
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
      font-size: 1.35rem;
      font-weight: 800;
      font-family: var(--font-mono);
      color: var(--accent-indigo);
    }
    .role-title {
      font-size: 1.55rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .company-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.3rem;
    }
    .company-name {
      color: var(--accent-cyan);
      font-weight: 600;
    }
    .dot-separator {
      opacity: 0.5;
    }
    .views-count {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .amharic-modal-title {
      font-size: 1.05rem;
      color: var(--text-muted);
      font-weight: 600;
      margin-top: 0.15rem;
    }

    /* Badge Strip: Mode & Type + Share & Bookmark */
    .badge-strip {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .header-actions-right {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-left: auto;
    }
    .btn-action-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.38rem 0.95rem;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-action-pill:hover {
      background: var(--border-subtle);
      color: var(--text-primary);
    }
    .btn-action-pill.saved {
      background: rgba(14, 165, 233, 0.15);
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }

    /* "At a Glance" Block */
    .at-a-glance-box {
      margin-top: 1.5rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
    }
    .glance-heading {
      font-size: 0.825rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin-bottom: 0.85rem;
    }
    .glance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 0.85rem;
    }
    .glance-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      transition: border-color var(--transition-fast);
    }
    .glance-card.urgent-border {
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.04);
    }
    .glance-icon-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--accent-cyan);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .glance-icon-circle.salary-icon {
      color: var(--accent-primary);
      background: var(--accent-primary-subtle);
      border-color: transparent;
    }
    .glance-icon-circle.urgent-icon {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
    }
    .glance-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      overflow: hidden;
    }
    .glance-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .glance-value {
      font-size: 0.885rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .salary-highlight {
      color: var(--accent-primary);
    }
    .urgent-text {
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .urgent-sub-tag {
      font-size: 0.65rem;
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-sm);
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      font-weight: 700;
    }

    /* Details Sections */
    .detail-section {
      margin-top: 1.75rem;
    }
    .section-heading {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }
    .body-text {
      color: var(--text-primary);
      font-size: 0.975rem;
      line-height: 1.7;
    }
    .bullet-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .bullet-list li {
      position: relative;
      padding-left: 1.5rem;
      color: var(--text-primary);
      font-size: 0.935rem;
      line-height: 1.6;
    }
    .bullet-list li::before {
      content: "•";
      position: absolute;
      left: 0.35rem;
      color: var(--accent-primary);
      font-size: 1.25rem;
      line-height: 1;
    }
    .skills-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    /* Employer About Section */
    .employer-card {
      padding: 1.25rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
    }
    .employer-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }
    .employer-title-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .employer-name {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }
    .verified-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-full);
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
    .unverified-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-full);
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }
    .employer-desc-muted {
      color: var(--text-muted);
      font-style: italic;
    }
    .employer-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      flex-wrap: wrap;
    }
    .website-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .employer-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    /* Similar Roles Grid */
    .similar-roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.85rem;
      margin-top: 0.5rem;
    }
    .similar-card {
      padding: 0.95rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .similar-card:hover {
      border-color: var(--accent-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    .similar-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .similar-comp {
      color: var(--accent-cyan);
      font-weight: 600;
    }
    .similar-title {
      font-size: 0.925rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.35;
    }
    .similar-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.5rem;
      font-size: 0.775rem;
    }
    .similar-salary {
      font-weight: 700;
      color: var(--accent-primary);
    }
    .similar-link {
      color: var(--text-muted);
      font-weight: 600;
    }
    .similar-card:hover .similar-link {
      color: var(--accent-primary);
    }

    /* Modal Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-subtle);
    }
    .btn-apply {
      padding: 0.75rem 1.85rem;
    }
    .applied-indicator-btn {
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.1);
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    /* Apply Box */
    .apply-box {
      margin-top: 1.5rem;
    }
    .section-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .section-desc {
      color: var(--text-muted);
      font-size: 0.885rem;
      margin-bottom: 1.5rem;
    }
    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.35);
      color: #fb7185;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.4rem;
    }
    .required-star {
      color: #f43f5e;
    }
    .optional-tag {
      font-weight: 400;
      color: var(--text-muted);
      font-size: 0.78rem;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 0.95rem;
      outline: none;
      transition: all var(--transition-fast);
    }
    .form-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-primary-subtle);
    }
    .form-input.input-error {
      border-color: #f43f5e;
      background: rgba(244, 63, 94, 0.05);
    }
    .textarea-input {
      resize: vertical;
      min-height: 100px;
    }
    .inline-validation-error {
      font-size: 0.785rem;
      color: #fb7185;
      margin-top: 0.35rem;
      font-weight: 600;
    }
    .apply-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.75rem;
    }

    /* Submission Success Card */
    .submission-success-card {
      text-align: center;
      padding: 3rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .success-icon-orb {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid #34d399;
      color: #34d399;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.3);
    }
    .success-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }
    .success-desc {
      color: var(--text-secondary);
      font-size: 0.95rem;
      max-width: 520px;
      line-height: 1.6;
      margin: 0;
    }
    .success-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 640px) {
      .modal-panel {
        padding: 1.5rem;
      }
      .glance-grid {
        grid-template-columns: 1fr;
      }
      .header-actions-right {
        margin-left: 0;
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class JobDetailModalComponent implements OnInit, OnDestroy {
  @ViewChild('modalContainer') modalContainer?: ElementRef<HTMLElement>;

  public readonly seekerService = inject(SeekerService);
  public readonly jobService = inject(JobService);
  public readonly auth = inject(AuthService);

  public readonly job = input.required<JobDetail>();
  public readonly close = output<void>();
  public readonly requestAuth = output<void>();
  public readonly goToTracker = output<void>();

  public readonly isApplying = signal<boolean>(false);
  public readonly submitting = signal<boolean>(false);
  public readonly submitted = signal<boolean>(false);
  public readonly formSubmitted = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly logoFailed = signal<boolean>(false);
  public readonly shareCopied = signal<boolean>(false);

  // Form inputs: coverNote starts EMPTY
  public applicantName = '';
  public applicantEmail = '';
  public resumeUrl = '';
  public resumeFileName = '';
  public coverNote = '';

  public shareUrl = signal<string>('');

  ngOnInit(): void {
    // 1. Lock background scrolling while modal is open
    document.body.style.overflow = 'hidden';

    // 2. Prefill user profile if logged in
    const user = this.auth.currentUser();
    if (user) {
      this.applicantName = user.fullName || `${user.firstName} ${user.lastName}`;
      this.applicantEmail = user.email;
    }

    // 3. Set shareable URL
    const url = `${window.location.origin}/jobs/${this.job().id}`;
    this.shareUrl.set(url);

    // 4. Update browser URL to /jobs/:id without page reload
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ jobId: this.job().id }, '', `/jobs/${this.job().id}`);
    }
  }

  ngOnDestroy(): void {
    // Restore background scrolling
    document.body.style.overflow = '';
  }

  @HostListener('window:keydown.escape', ['$event'])
  handleEscape(event?: Event): void {
    event?.preventDefault();
    this.onClose();
  }

  onBackdropClick(_event?: MouseEvent): void {
    this.onClose();
  }

  onClose(): void {
    // Revert browser URL to /jobs or /
    if (typeof window !== 'undefined' && window.history) {
      const target = window.location.pathname.startsWith('/jobs') ? '/jobs' : '/';
      window.history.pushState(null, '', target);
    }
    this.close.emit();
  }

  toggleBookmark(jobId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.requestAuth.emit();
      return;
    }
    this.seekerService.toggleSaveJob(jobId).subscribe();
  }

  shareRole(j: JobDetail): void {
    const url = `${window.location.origin}/jobs/${j.id}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.shareCopied.set(true);
        setTimeout(() => this.shareCopied.set(false), 2200);
      });
    } else {
      this.shareCopied.set(true);
      setTimeout(() => this.shareCopied.set(false), 2200);
    }
  }

  startApplying(): void {
    if (!this.auth.isAuthenticated()) {
      this.requestAuth.emit();
      return;
    }
    this.isApplying.set(true);
  }

  isEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  submitApplication(jobId: string): void {
    this.formSubmitted.set(true);

    if (!this.applicantName.trim()) {
      this.errorMessage.set('Please enter your full name before submitting.');
      return;
    }
    if (!this.isEmailValid(this.applicantEmail)) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }
    if (!this.resumeUrl.trim()) {
      this.errorMessage.set('Please upload your resume (PDF or DOCX) before submitting.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.seekerService.applyForJob(jobId, {
      resumeUrl: this.resumeUrl.trim(),
      coverLetter: this.coverNote.trim() || undefined
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.error || 'Could not submit application.');
      }
    });
  }

  parseBulletList(text?: string): string[] {
    if (!text) return [];
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-•*]\s*/, ''));
  }

  parseBenefits(benefits?: string): string[] {
    if (!benefits) return [];
    const salaryRegex = /(ETB|USD|\$|\/ month|\/ mo|\/ yr|base salary|ተደራዳሪ|Negotiable)/i;
    return this.parseBulletList(benefits)
      .filter(line => !salaryRegex.test(line));
  }

  isUrgentDeadline(utc?: string): boolean {
    if (!utc) return false;
    const deadline = new Date(utc).getTime();
    const now = Date.now();
    const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }

  formatSalary(min?: number, max?: number, curr = 'ETB', isNegotiable = false): string {
    if (isNegotiable) return 'Negotiable';
    const isEtb = curr?.toUpperCase() === 'ETB';
    if (isEtb) {
      if (min && max) return `ETB ${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k /mo`;
      if (min) return `From ETB ${(min / 1000).toFixed(0)}k /mo`;
      if (max) return `Up to ETB ${(max / 1000).toFixed(0)}k /mo`;
      return 'Competitive (ETB)';
    }
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k USD /yr`;
    if (min) return `From $${(min / 1000).toFixed(0)}k USD /yr`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k USD /yr`;
    return 'Competitive';
  }

  formatDeadline(utc?: string): string {
    if (!utc) return 'No Deadline Specified';
    const d = new Date(utc);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getJobTypeLabel(type: number): string {
    const map: Record<number, string> = {
      1: 'Full-time',
      2: 'Part-time',
      3: 'Contract',
      4: 'Remote',
      5: 'Internship'
    };
    return map[type] || 'Full-time';
  }

  getExperienceLevelLabel(level: number): string {
    const map: Record<number, string> = {
      1: 'Entry Level (0 - 2 yrs)',
      2: 'Mid Level (2 - 5 yrs)',
      3: 'Senior Level (5+ yrs)',
      4: 'Lead / Staff',
      5: 'Executive'
    };
    return map[level] || 'Mid Level';
  }

  readonly getInitials = getInitials;

  similarRoles(): JobListItem[] {
    const cur = this.job();
    return this.jobService
      .jobs()
      .filter(j => j.id !== cur.id && (j.category.id === cur.category.id || j.company.id === cur.company.id))
      .slice(0, 3);
  }

  openSimilarRole(id: string): void {
    this.jobService.selectJob(id);
  }
}
