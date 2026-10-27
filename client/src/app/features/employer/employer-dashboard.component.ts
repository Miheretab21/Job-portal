import { Component, OnInit, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployerService } from '../../core/services/employer.service';
import { AuthService } from '../../core/services/auth.service';
import { UploadService } from '../../core/services/upload.service';
import { EmployerJobItem } from '../../core/models/employer.model';
import { getInitials } from '../../core/utils/avatar.util';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <div class="badge-role">
            <span class="live-indicator"></span>
            <span>Employer Management Portal</span>
          </div>
          <h2 class="portal-title">Company Hiring Dashboard</h2>
          <p class="portal-subtitle">
            Manage your published job requisitions, track pipeline velocity, and review applicant submissions.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-outline" (click)="exploreJobs.emit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Explore Public Jobs
          </button>
          <button class="btn btn-secondary" (click)="viewPipeline.emit(null)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Candidate Pipeline
          </button>
          <button class="btn btn-primary" (click)="openPostJob.emit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Post a New Role
          </button>
        </div>
      </div>

      <!-- Company Profile & Verification Status Banner -->
      <div class="company-banner glass-panel">
        <div class="company-banner-main">
          <div 
            class="company-avatar" 
            [class.has-logo]="!!employerService.companyProfile()?.logoUrl"
            (click)="openCompanyModal()"
            title="Click to edit organization profile and logo"
            role="button"
            tabindex="0">
            @if (employerService.companyProfile()?.logoUrl) {
              <img [src]="employerService.companyProfile()?.logoUrl" [alt]="employerService.companyProfile()?.name" class="company-avatar-logo" />
            } @else {
              {{ getInitials(employerService.companyProfile()?.name || 'CO') }}
            }
            <div class="avatar-edit-overlay" title="Upload or change brand logo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          <div class="company-info-block">
            <div class="company-name-row">
              <h3 class="company-heading">
                {{ employerService.companyProfile()?.name || 'Your Organization' }}
              </h3>
              @if (employerService.companyProfile()?.isVerified) {
                <span class="verification-badge verified" title="Verified employer organization">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Verified Organization
                </span>
              } @else {
                <span class="verification-badge pending" title="Platform verification is reviewed and granted by platform administrators upon credential verification.">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Pending Admin Verification
                </span>
              }
            </div>

            <p class="company-desc-line">
              {{ employerService.companyProfile()?.description || 'No organization overview added yet. Set your overview so candidates know about your mission, values, and work culture.' }}
            </p>

            <div class="company-meta-tags">
              @if (employerService.companyProfile()?.industry) {
                <span class="meta-tag">🏢 {{ employerService.companyProfile()?.industry }}</span>
              }
              @if (employerService.companyProfile()?.companySize) {
                <span class="meta-tag">👥 {{ employerService.companyProfile()?.companySize }}</span>
              }
              @if (employerService.companyProfile()?.location) {
                <span class="meta-tag">📍 {{ employerService.companyProfile()?.location }}</span>
              }
              @if (employerService.companyProfile()?.website) {
                <a [href]="employerService.companyProfile()?.website" target="_blank" rel="noopener noreferrer" class="meta-link">
                  🌐 {{ employerService.companyProfile()?.website }}
                </a>
              }
            </div>
          </div>
        </div>

        <div class="company-banner-actions">
          @if (!employerService.companyProfile()?.logoUrl) {
            <button class="btn btn-sm btn-secondary add-logo-btn" (click)="openCompanyModal()" title="Upload company brand logo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Add Logo
            </button>
          }
          <button class="btn btn-sm btn-outline edit-profile-btn" (click)="openCompanyModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="metrics-grid">
        <div class="metric-card glass-panel">
          <div class="metric-icon active-icon">🚀</div>
          <div class="metric-data">
            <span class="metric-val">{{ employerService.summary()?.activeJobsCount ?? employerService.jobs().length }}</span>
            <span class="metric-label">Active Listings</span>
          </div>
        </div>

        <div class="metric-card glass-panel">
          <div class="metric-icon applicants-icon">👥</div>
          <div class="metric-data">
            <span class="metric-val">{{ employerService.summary()?.totalApplicantsCount ?? 0 }}</span>
            <span class="metric-label">Total Applicants</span>
          </div>
        </div>

        <div class="metric-card glass-panel">
          <div class="metric-icon shortlist-icon">⭐</div>
          <div class="metric-data">
            <span class="metric-val">{{ employerService.summary()?.shortlistedCount ?? 0 }}</span>
            <span class="metric-label">Shortlisted</span>
          </div>
        </div>

        <div class="metric-card glass-panel">
          <div class="metric-icon interview-icon">🎙️</div>
          <div class="metric-data">
            <span class="metric-val">{{ employerService.summary()?.interviewsCount ?? 0 }}</span>
            <span class="metric-label">In Interview</span>
          </div>
        </div>
      </div>

      <!-- Jobs Section -->
      <section class="jobs-management-section">
        <div class="section-top-bar">
          <div>
            <h3 class="section-title">Job Requisitions</h3>
            <span class="section-desc">Manage job status, monitor applicant volume, and preview public listings.</span>
          </div>
          <span class="job-count-tag">{{ employerService.jobs().length }} listings</span>
        </div>

        @if (employerService.loadingJobs()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <span>Loading company postings...</span>
          </div>
        } @else if (employerService.jobs().length === 0) {
          <div class="empty-state glass-panel">
            <div class="empty-icon">📁</div>
            <h3>No job postings yet</h3>
            <p>Publish your first engineering position to start receiving qualified candidates.</p>
            <button class="btn btn-primary mt-3" (click)="openPostJob.emit()">Create First Listing</button>
          </div>
        } @else {
          <div class="jobs-table-wrap glass-panel">
            <table class="jobs-table">
              <thead>
                <tr>
                  <th>Job Title & Details</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Applicants</th>
                  <th>Published Date</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (job of employerService.jobs(); track job.id) {
                  <tr class="job-row">
                    <td>
                      <div class="job-meta-cell clickable-meta-cell" (click)="selectJob.emit(job.id)" title="Click to view listing details">
                        <span class="job-row-title">
                          {{ job.title }}
                        </span>
                        <div class="job-sub-meta">
                          <span>{{ job.location }}</span>
                          <span class="dot-sep">•</span>
                          <span>{{ job.isRemote ? 'Remote' : 'On-site' }}</span>
                          <span class="dot-sep">•</span>
                          <span>{{ getJobTypeLabel(job.jobType) }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="category-badge">{{ job.categoryName }}</span>
                    </td>
                    <td>
                      <select 
                        class="status-dropdown" 
                        [value]="job.status" 
                        (change)="changeJobStatus(job.id, $event)">
                        <option [value]="2" [selected]="job.status === 2">Published (Active)</option>
                        <option [value]="1" [selected]="job.status === 1">Draft</option>
                        <option [value]="3" [selected]="job.status === 3">Closed</option>
                      </select>
                    </td>
                    <td>
                      <span class="views-tag">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {{ job.viewsCount }}
                      </span>
                    </td>
                    <td>
                      <button 
                        class="applicants-badge-btn" 
                        [class.has-applicants]="job.applicantsCount > 0"
                        (click)="viewPipeline.emit(job.id)">
                        <span>👥 {{ job.applicantsCount }} candidates</span>
                      </button>
                    </td>
                    <td>
                      <span class="date-text">{{ formatDate(job.createdAtUtc) }}</span>
                    </td>
                    <td class="text-right table-actions-cell">
                      <div class="actions-group">
                        <button type="button" class="action-btn review-btn" (click)="viewPipeline.emit(job.id)" title="View candidate pipeline">
                          Pipeline
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </button>
                        <button type="button" class="action-btn edit-btn" (click)="openEditJob.emit(job.id)" title="Edit job requisition">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button type="button" class="action-btn delete-btn" (click)="confirmDelete(job)" title="Delete job requisition">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <!-- Edit Organization Profile Modal -->
      @if (isCompanyModalOpen()) {
        <div class="modal-backdrop" (click)="closeCompanyModal()">
          <div class="modal-panel glass-panel-glow" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="closeCompanyModal()" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <div class="modal-header">
              <div class="modal-header-icon">🏢</div>
              <div>
                <h3 class="modal-title">Edit Organization Profile</h3>
                <p class="modal-subtitle">Manage company overview, website, industry, and verification details.</p>
              </div>
            </div>

            <form class="company-form" (ngSubmit)="saveCompanyProfile()">
              <!-- Company Brand Logo Section -->
              <div class="form-group logo-management-group">
                <label class="form-label">Organization Brand Logo</label>
                <div class="logo-uploader-row">
                  <div class="logo-preview-box">
                    @if (editLogoUrl) {
                      <img [src]="editLogoUrl" alt="Company Logo Preview" class="logo-preview-img" (error)="onEditLogoError()" />
                    } @else {
                      <span class="logo-preview-initials">{{ getInitials(editName || 'CO') }}</span>
                    }
                  </div>

                  <div class="logo-upload-controls">
                    <div class="logo-btn-row">
                      <label class="btn btn-sm btn-upload-logo" [class.disabled]="isUploadingLogo()">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>{{ isUploadingLogo() ? 'Uploading Logo...' : 'Upload Logo Image' }}</span>
                        <input 
                          type="file" 
                          class="hidden-file-input" 
                          accept=".png,.jpg,.jpeg,.webp,.svg" 
                          (change)="onLogoFileSelected($event)" 
                          [disabled]="isUploadingLogo()" />
                      </label>

                      @if (editLogoUrl) {
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeLogo()" title="Remove company logo">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Remove
                        </button>
                      }
                    </div>

                    <p class="logo-upload-hint">
                      Supports PNG, JPG, WebP, or SVG (max 10MB). Appears on public job cards, detail view, and dashboard.
                    </p>

                    @if (uploadLogoError()) {
                      <div class="upload-error-msg">{{ uploadLogoError() }}</div>
                    }
                  </div>
                </div>

                <div class="logo-url-fallback">
                  <div class="url-input-wrap">
                    <span class="url-icon">🔗</span>
                    <input 
                      type="url" 
                      class="form-input logo-url-input" 
                      [(ngModel)]="editLogoUrl" 
                      name="editLogoUrl" 
                      placeholder="Or enter public image URL (e.g. https://domain.et/logo.png)" />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Company / Organization Name <span class="req">*</span></label>
                <input type="text" class="form-input" [(ngModel)]="editName" name="editName" required />
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label">Industry</label>
                  <input type="text" class="form-input" [(ngModel)]="editIndustry" name="editIndustry" placeholder="e.g. Financial Technology, Banking" />
                </div>

                <div class="form-group">
                  <label class="form-label">Company Size</label>
                  <select class="form-input" [(ngModel)]="editCompanySize" name="editCompanySize">
                    <option value="">Select size...</option>
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="500+ employees">500+ employees</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label">Website</label>
                  <input type="url" class="form-input" [(ngModel)]="editWebsite" name="editWebsite" placeholder="https://company.et" />
                </div>

                <div class="form-group">
                  <label class="form-label">Headquarters Location</label>
                  <input type="text" class="form-input" [(ngModel)]="editLocation" name="editLocation" placeholder="e.g. Addis Ababa, Ethiopia" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Company Overview / Mission</label>
                <textarea 
                  class="form-input" 
                  rows="4" 
                  [(ngModel)]="editDescription" 
                  name="editDescription" 
                  placeholder="Describe what your organization builds, work culture, engineering values, and mission..."></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeCompanyModal()" [disabled]="isSavingCompany()">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="isSavingCompany()">
                  {{ isSavingCompany() ? 'Saving Changes...' : 'Save Profile' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Job Confirmation Modal -->
      @if (jobToDelete(); as target) {
        <div class="modal-backdrop" (click)="cancelDelete()">
          <div class="modal-panel delete-modal-panel glass-panel-glow" (click)="$event.stopPropagation()">
            <div class="delete-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 class="delete-modal-title">Delete Job Requisition?</h3>
            <p class="delete-modal-text">
              Are you sure you want to permanently delete <strong>"{{ target.title }}"</strong>? 
              This action will remove the listing from public search and close active candidate workflows.
            </p>
            <div class="delete-modal-actions">
              <button type="button" class="btn btn-secondary" (click)="cancelDelete()" [disabled]="isDeletingJob()">
                Cancel
              </button>
              <button type="button" class="btn btn-danger" (click)="executeDelete()" [disabled]="isDeletingJob()">
                {{ isDeletingJob() ? 'Deleting...' : 'Delete Requisition' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 5rem;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .badge-role {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.8rem;
      border-radius: var(--radius-full);
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent-indigo);
      margin-bottom: 0.75rem;
      font-family: var(--font-mono);
      letter-spacing: 0.04em;
    }
    .live-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-indigo);
      box-shadow: 0 0 10px var(--accent-indigo);
      animation: pulse 2s infinite;
    }
    .portal-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.025em;
    }
    .portal-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 0.4rem;
      max-width: 620px;
      line-height: 1.55;
    }
    .header-actions {
      display: flex;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    /* Company Profile Banner */
    .company-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem 1.75rem;
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      flex-wrap: wrap;
    }
    .company-banner-main {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex: 1;
      min-width: 280px;
    }
    .company-avatar {
      width: 58px;
      height: 58px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(14, 165, 233, 0.2));
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: var(--accent-indigo);
      font-weight: 800;
      font-size: 1.35rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .company-avatar:hover {
      transform: scale(1.05);
      border-color: var(--accent-indigo);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
    .company-avatar.has-logo {
      background: #ffffff;
      padding: 3px;
    }
    .company-avatar-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: calc(var(--radius-md) - 3px);
    }
    .avatar-edit-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      opacity: 0;
      transition: opacity var(--transition-fast);
      border-radius: inherit;
    }
    .company-avatar:hover .avatar-edit-overlay {
      opacity: 1;
    }
    .company-info-block {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .company-name-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .company-heading {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.01em;
    }
    .verification-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.725rem;
      font-weight: 700;
      padding: 0.2rem 0.65rem;
      border-radius: var(--radius-full);
    }
    .verification-badge.verified {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
    .verification-badge.pending {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }
    .company-desc-line {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
      max-width: 650px;
      line-height: 1.5;
    }
    .company-meta-tags {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
      margin-top: 0.2rem;
      font-size: 0.8rem;
    }
    .meta-tag {
      color: var(--text-muted);
    }
    .meta-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-weight: 600;
    }
    .meta-link:hover {
      text-decoration: underline;
    }
    .company-banner-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .add-logo-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-weight: 700;
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-indigo);
      border: 1px solid rgba(99, 102, 241, 0.4);
      transition: all var(--transition-fast);
    }
    .add-logo-btn:hover {
      background: var(--accent-indigo);
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.75rem;
    }
    .metric-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: all var(--transition-normal);
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-hover);
    }
    .metric-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
    }
    .metric-data {
      display: flex;
      flex-direction: column;
    }
    .metric-val {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-primary);
      font-family: var(--font-mono);
      line-height: 1.1;
    }
    .metric-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }

    /* Section */
    .jobs-management-section {
      margin-top: 1rem;
    }
    .section-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .section-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .section-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .job-count-tag {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent-cyan);
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.3);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-family: var(--font-mono);
    }
    .jobs-table-wrap {
      border-radius: var(--radius-lg);
      overflow-x: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      box-shadow: var(--shadow-sm);
    }
    .jobs-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .jobs-table th {
      padding: 0.85rem 0.95rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid var(--border-card);
      background: var(--bg-surface);
      white-space: nowrap;
    }
    .jobs-table th.text-right {
      padding-right: 1.25rem;
    }
    .jobs-table td {
      padding: 0.95rem 0.95rem;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
      color: var(--text-primary);
    }
    .job-row:hover td {
      background: var(--bg-card-hover);
    }
    .job-meta-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .clickable-meta-cell {
      cursor: pointer;
      padding: 0.35rem 0.5rem;
      margin: -0.35rem -0.5rem;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }
    .clickable-meta-cell:hover {
      background: rgba(99, 102, 241, 0.08);
    }
    .clickable-meta-cell:hover .job-row-title {
      color: var(--accent-primary);
      text-decoration: underline;
    }
    .job-row-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      transition: color var(--transition-fast);
    }
    .job-sub-meta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.775rem;
      color: var(--text-muted);
    }
    .dot-sep {
      opacity: 0.4;
    }
    .category-badge {
      font-size: 0.775rem;
      color: var(--accent-cyan);
      background: rgba(14, 165, 233, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
      white-space: nowrap;
    }
    .status-dropdown {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      padding: 0.38rem 0.65rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: all var(--transition-fast);
    }
    .status-dropdown:hover, .status-dropdown:focus {
      border-color: var(--accent-primary);
    }
    .status-dropdown option {
      background: var(--bg-card);
      color: var(--text-primary);
    }
    .views-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      white-space: nowrap;
    }
    .applicants-badge-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-secondary);
      padding: 0.35rem 0.7rem;
      border-radius: var(--radius-full);
      font-size: 0.775rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .applicants-badge-btn.has-applicants {
      background: rgba(99, 102, 241, 0.14);
      border-color: rgba(99, 102, 241, 0.35);
      color: var(--accent-indigo);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.15);
    }
    .applicants-badge-btn:hover {
      border-color: var(--accent-primary);
      color: var(--text-primary);
    }
    .date-text {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      white-space: nowrap;
    }
    .text-right {
      text-align: right;
    }
    .table-actions-cell {
      white-space: nowrap;
      vertical-align: middle;
      text-align: right;
      padding-right: 1.25rem;
      min-width: 180px;
    }
    .actions-group {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.45rem;
      vertical-align: middle;
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.32rem;
      font-size: 0.775rem;
      font-weight: 600;
      padding: 0.38rem 0.68rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-card);
      background: var(--bg-surface);
      color: var(--text-primary);
      cursor: pointer;
      line-height: 1.2;
      transition: all var(--transition-fast);
      text-decoration: none;
    }
    .review-btn {
      color: var(--accent-indigo);
      border-color: rgba(99, 102, 241, 0.3);
      background: rgba(99, 102, 241, 0.06);
    }
    .review-btn:hover {
      background: var(--accent-indigo);
      color: #fff;
      border-color: var(--accent-indigo);
    }
    .edit-btn {
      color: var(--accent-cyan);
      border-color: rgba(14, 165, 233, 0.3);
      background: rgba(14, 165, 233, 0.06);
    }
    .edit-btn:hover {
      background: var(--accent-cyan);
      color: #fff;
      border-color: var(--accent-cyan);
    }
    .delete-btn {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.06);
      padding: 0.38rem 0.55rem;
    }
    .delete-btn:hover {
      background: #ef4444;
      color: #fff;
      border-color: #ef4444;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem 0;
      gap: 1rem;
      color: var(--text-secondary);
    }
    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      border-radius: var(--radius-xl);
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* Company Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }
    .modal-panel {
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 2.25rem;
      position: relative;
    }
    .close-btn {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .modal-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .modal-header-icon {
      font-size: 2rem;
    }
    .modal-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }
    .modal-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 0.45rem;
    }
    .req {
      color: var(--accent-rose, #f43f5e);
    }
    .form-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.65rem 0.95rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      font-size: 0.9rem;
      outline: none;
      transition: all var(--transition-fast);
    }
    .form-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px var(--accent-primary-glow);
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .logo-management-group {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.15rem;
      margin-bottom: 1.5rem;
    }
    .logo-uploader-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .logo-preview-box {
      width: 68px;
      height: 68px;
      border-radius: var(--radius-md);
      background: var(--bg-card);
      border: 2px dashed var(--border-card);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .logo-preview-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #ffffff;
    }
    .logo-preview-initials {
      font-weight: 800;
      font-size: 1.35rem;
      color: var(--accent-indigo);
    }
    .logo-upload-controls {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
      min-width: 220px;
    }
    .logo-btn-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .btn-upload-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: var(--accent-indigo);
      font-weight: 700;
      font-size: 0.8rem;
      padding: 0.45rem 0.95rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
    }
    .btn-upload-logo:hover:not(.disabled) {
      background: var(--accent-indigo);
      color: #fff;
    }
    .btn-upload-logo.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .hidden-file-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }
    .btn-outline-danger {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #ef4444;
      font-weight: 600;
      font-size: 0.8rem;
      padding: 0.45rem 0.75rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-outline-danger:hover {
      background: #ef4444;
      color: #fff;
    }
    .logo-upload-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }
    .upload-error-msg {
      font-size: 0.75rem;
      color: #f87171;
      font-weight: 600;
    }
    .logo-url-fallback {
      margin-top: 0.75rem;
    }
    .url-input-wrap {
      display: flex;
      align-items: center;
      position: relative;
    }
    .url-icon {
      position: absolute;
      left: 0.75rem;
      font-size: 0.85rem;
      pointer-events: none;
      opacity: 0.7;
    }
    .logo-url-input {
      padding-left: 2.2rem !important;
      font-size: 0.825rem !important;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }
    .delete-modal-panel {
      max-width: 440px;
      text-align: center;
      padding: 2.25rem 2rem;
    }
    .delete-icon-wrap {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .delete-modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.5rem;
    }
    .delete-modal-text {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.55;
      margin: 0 0 1.75rem;
    }
    .delete-modal-actions {
      display: flex;
      justify-content: center;
      gap: 0.85rem;
    }
    .btn-danger {
      background: #ef4444;
      border: 1px solid #dc2626;
      color: #fff;
      font-weight: 700;
      padding: 0.65rem 1.4rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
    }
    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    @media (max-width: 640px) {
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
      .actions-group {
        flex-wrap: wrap;
        justify-content: flex-end;
      }
    }
  `]
})
export class EmployerDashboardComponent implements OnInit {
  public readonly employerService = inject(EmployerService);
  public readonly auth = inject(AuthService);
  public readonly uploadService = inject(UploadService);

  public readonly openPostJob = output<void>();
  public readonly openEditJob = output<string>();
  public readonly viewPipeline = output<string | null>();
  public readonly exploreJobs = output<void>();
  public readonly selectJob = output<string>();

  public readonly isCompanyModalOpen = signal<boolean>(false);
  public readonly isSavingCompany = signal<boolean>(false);

  // Delete Job Requisition Modal State
  public readonly jobToDelete = signal<EmployerJobItem | null>(null);
  public readonly isDeletingJob = signal<boolean>(false);

  // Logo Upload State
  public editLogoUrl = '';
  public readonly isUploadingLogo = signal<boolean>(false);
  public readonly uploadLogoError = signal<string | null>(null);

  // Edit fields
  public editName = '';
  public editDescription = '';
  public editWebsite = '';
  public editLocation = '';
  public editIndustry = '';
  public editCompanySize = '';

  ngOnInit(): void {
    if (!this.employerService.companyProfile()) {
      this.employerService.loadCompanyProfile().subscribe();
    }
  }

  readonly getInitials = getInitials;

  openCompanyModal(): void {
    const comp = this.employerService.companyProfile();
    this.editName = comp?.name || '';
    this.editDescription = comp?.description || '';
    this.editWebsite = comp?.website || '';
    this.editLocation = comp?.location || '';
    this.editIndustry = comp?.industry || '';
    this.editCompanySize = comp?.companySize || '';
    this.editLogoUrl = comp?.logoUrl || '';
    this.uploadLogoError.set(null);
    this.isCompanyModalOpen.set(true);
  }

  closeCompanyModal(): void {
    this.isCompanyModalOpen.set(false);
  }

  saveCompanyProfile(): void {
    this.isSavingCompany.set(true);
    this.employerService.updateCompanyProfile({
      name: this.editName.trim(),
      description: this.editDescription.trim(),
      website: this.editWebsite.trim(),
      location: this.editLocation.trim(),
      industry: this.editIndustry.trim(),
      companySize: this.editCompanySize.trim(),
      logoUrl: this.editLogoUrl.trim() || undefined
    }).subscribe({
      next: () => {
        this.isSavingCompany.set(false);
        this.isCompanyModalOpen.set(false);
      },
      error: () => {
        this.isSavingCompany.set(false);
      }
    });
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isUploadingLogo.set(true);
      this.uploadLogoError.set(null);
      this.uploadService.uploadFile(file, 'logos').subscribe({
        next: (res) => {
          this.editLogoUrl = res.url;
          this.isUploadingLogo.set(false);
        },
        error: (err) => {
          this.uploadLogoError.set(err?.error?.error || 'Failed to upload logo image. Ensure file is PNG, JPG, WebP, or SVG under 10MB.');
          this.isUploadingLogo.set(false);
        }
      });
    }
  }

  removeLogo(): void {
    this.editLogoUrl = '';
  }

  onEditLogoError(): void {
    // If the image preview fails to load
  }

  confirmDelete(job: EmployerJobItem): void {
    this.jobToDelete.set(job);
  }

  cancelDelete(): void {
    this.jobToDelete.set(null);
  }

  executeDelete(): void {
    const target = this.jobToDelete();
    if (!target) return;
    this.isDeletingJob.set(true);
    this.employerService.deleteJob(target.id).subscribe({
      next: () => {
        this.isDeletingJob.set(false);
        this.jobToDelete.set(null);
      },
      error: () => {
        this.isDeletingJob.set(false);
      }
    });
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

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  changeJobStatus(jobId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = parseInt(select.value, 10);
    this.employerService.updateJobStatus(jobId, status).subscribe();
  }
}
