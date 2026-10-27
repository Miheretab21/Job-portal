import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <!-- Top Overseer Header -->
      <div class="admin-header">
        <div class="header-titles">
          <div class="status-beacon-wrap">
            <span class="beacon-dot"></span>
            <span class="beacon-label">SYSTEM HEALTH: OPTIMAL • POSTGRESQL 18 • .NET 10 LTS</span>
          </div>
          <h1 class="page-title">Platform Administration & Governance</h1>
          <p class="page-subtitle">
            Oversee user accounts, moderate global job requisitions, inspect real-time application throughput, and manage taxonomy.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary btn-refresh" (click)="refreshAll()" [disabled]="adminService.loadingAnalytics()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.spinning]="adminService.loadingAnalytics()">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      <!-- Overview Metric Tiles -->
      @if (adminService.analytics(); as a) {
        <div class="metrics-grid">
          <div class="metric-card glass-panel-glow">
            <div class="metric-top">
              <span class="metric-label">Platform Members</span>
              <div class="metric-icon-orb orb-indigo">👥</div>
            </div>
            <div class="metric-number">{{ a.totalUsers }}</div>
            <div class="metric-sub">
              <span class="sub-pill pill-cyan">{{ a.seekerCount }} Seekers</span>
              <span class="sub-pill pill-indigo">{{ a.employerCount }} Employers</span>
              <span class="sub-pill pill-purple">{{ a.adminCount }} Admins</span>
            </div>
          </div>

          <div class="metric-card glass-panel-glow">
            <div class="metric-top">
              <span class="metric-label">Job Requisitions</span>
              <div class="metric-icon-orb orb-cyan">💼</div>
            </div>
            <div class="metric-number">{{ a.totalJobs }}</div>
            <div class="metric-sub">
              <span class="sub-pill pill-emerald">{{ a.publishedJobs }} Published</span>
              <span class="sub-pill pill-amber">{{ a.draftJobs }} Drafts</span>
              <span class="sub-pill pill-rose">{{ a.archivedJobs }} Archived</span>
            </div>
          </div>

          <div class="metric-card glass-panel-glow">
            <div class="metric-top">
              <span class="metric-label">Application Pipeline</span>
              <div class="metric-icon-orb orb-emerald">📈</div>
            </div>
            <div class="metric-number">{{ a.totalApplications }}</div>
            <div class="metric-sub">
              <span class="sub-pill pill-emerald">{{ a.hiredApplications }} Placed / Hired</span>
              <span class="sub-pill pill-cyan">{{ a.inReviewApplications }} In Review</span>
            </div>
          </div>

          <div class="metric-card glass-panel-glow">
            <div class="metric-top">
              <span class="metric-label">Ecosystem Breadth</span>
              <div class="metric-icon-orb orb-purple">🌐</div>
            </div>
            <div class="metric-number">{{ a.totalCategories }}</div>
            <div class="metric-sub">
              <span class="sub-text">Across {{ a.totalCompanies }} registered enterprise companies</span>
            </div>
          </div>
        </div>
      }

      <!-- Navigation Tabs Strip -->
      <div class="tabs-nav-strip">
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'overview'" 
          (click)="activeTab.set('overview')">
          <span class="tab-icon">📊</span>
          <span>Telemetry & Activity</span>
        </button>

        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'jobs'" 
          (click)="onSelectJobsTab()">
          <span class="tab-icon">💼</span>
          <span>Job Moderation</span>
          <span class="tab-badge">{{ adminService.jobs().length }}</span>
        </button>

        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'users'" 
          (click)="onSelectUsersTab()">
          <span class="tab-icon">👥</span>
          <span>User Governance</span>
          <span class="tab-badge">{{ adminService.users().length }}</span>
        </button>

        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'categories'" 
          (click)="activeTab.set('categories')">
          <span class="tab-icon">🏷️</span>
          <span>Categories Taxonomy</span>
        </button>
      </div>

      <!-- Tab 1: Telemetry & Activity Feed -->
      @if (activeTab() === 'overview') {
        @if (adminService.analytics(); as a) {
          <div class="overview-dual-grid animate-fade-in">
            <!-- Left: Top Categories Breakdown -->
            <div class="section-card glass-panel">
              <h3 class="section-card-title">
                <span>Top Categories by Active Requisitions</span>
              </h3>
              <p class="section-card-desc">Distribution of published job openings across industry disciplines.</p>

              <div class="categories-metric-list">
                @for (cat of a.topCategories; track cat.id) {
                  <div class="category-metric-row">
                    <div class="cat-meta">
                      <span class="cat-icon">{{ cat.icon || '💼' }}</span>
                      <span class="cat-name">{{ cat.name }}</span>
                    </div>
                    <div class="cat-bar-wrap">
                      <div class="cat-bar-track">
                        <div class="cat-bar-fill" [style.width.%]="getCategoryPercentage(cat.activeJobsCount, a.publishedJobs)"></div>
                      </div>
                      <span class="cat-count">{{ cat.activeJobsCount }} active</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Right: Real-time Platform Activity Stream -->
            <div class="section-card glass-panel">
              <h3 class="section-card-title">
                <span>Real-Time Platform Activity Stream</span>
              </h3>
              <p class="section-card-desc">Latest registrations, job requisition updates, and candidate applications.</p>

              <div class="activity-stream">
                @for (act of a.recentActivities; track act.timestampUtc + act.title) {
                  <div class="activity-item">
                    <div class="activity-node" [ngClass]="'node-' + act.type">
                      @if (act.type === 'application') { 📋 }
                      @else if (act.type === 'job') { 💼 }
                      @else { 👤 }
                    </div>
                    <div class="activity-content">
                      <div class="activity-header">
                        <span class="activity-title">{{ act.title }}</span>
                        <span class="activity-time">{{ formatDate(act.timestampUtc) }}</span>
                      </div>
                      <span class="activity-desc">{{ act.description }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-stream">No activity recorded yet.</div>
                }
              </div>
            </div>
          </div>
        }
      }

      <!-- Tab 2: Job Moderation Console -->
      @if (activeTab() === 'jobs') {
        <div class="job-moderation-panel animate-fade-in">
          <div class="table-controls">
            <div class="status-filters">
              <button 
                class="filter-pill" 
                [class.active]="selectedJobStatus() === null" 
                (click)="filterJobsByStatus(null)">
                All Requisitions ({{ adminService.jobs().length }})
              </button>
              <button 
                class="filter-pill" 
                [class.active]="selectedJobStatus() === 2" 
                (click)="filterJobsByStatus(2)">
                Published
              </button>
              <button 
                class="filter-pill" 
                [class.active]="selectedJobStatus() === 1" 
                (click)="filterJobsByStatus(1)">
                Drafts
              </button>
              <button 
                class="filter-pill" 
                [class.active]="selectedJobStatus() === 3" 
                (click)="filterJobsByStatus(3)">
                Archived
              </button>
            </div>
          </div>

          @if (adminService.loadingJobs()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Fetching job requisitions...</span>
            </div>
          } @else if (adminService.jobs().length === 0) {
            <div class="empty-state glass-panel">
              <div class="empty-icon">💼</div>
              <h3>No job requisitions found</h3>
              <p>No jobs match the current moderation status filter.</p>
            </div>
          } @else {
            <div class="cyber-table-container glass-panel">
              <table class="cyber-table">
                <thead>
                  <tr>
                    <th>Role & Company</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Metrics</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (job of adminService.jobs(); track job.id) {
                    <tr>
                      <td>
                        <div class="table-role-cell">
                          <span class="role-title-text">{{ job.title }}</span>
                          <span class="company-subtext">
                            @if (job.companyLogoUrl) {
                              <img [src]="job.companyLogoUrl" alt="" class="table-mini-logo" />
                            }
                            {{ job.companyName }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span class="category-tag">{{ job.categoryName }}</span>
                      </td>
                      <td>
                        <span class="location-text">{{ job.location }}</span>
                        @if (job.isRemote) {
                          <span class="remote-badge">Remote</span>
                        }
                      </td>
                      <td>
                        <span class="status-chip" [ngClass]="getStatusChipClass(job.status)">
                          {{ getStatusLabel(job.status) }}
                        </span>
                      </td>
                      <td>
                        <div class="metrics-cell">
                          <span>👁️ {{ job.viewsCount }} views</span>
                          <span>📋 {{ job.applicationsCount }} apps</span>
                        </div>
                      </td>
                      <td>
                        <div class="actions-cell">
                          @if (job.status !== 2) {
                            <button 
                              class="btn-row btn-publish" 
                              (click)="adminService.updateJobStatus(job.id, 2).subscribe()"
                              title="Publish job to live directory">
                              Publish
                            </button>
                          }
                          @if (job.status === 2) {
                            <button 
                              class="btn-row btn-archive" 
                              (click)="adminService.updateJobStatus(job.id, 3).subscribe()"
                              title="Archive job requisition">
                              Archive
                            </button>
                          }
                          <button 
                            class="btn-row btn-delete" 
                            (click)="confirmDeleteJob(job.id, job.title)"
                            title="Soft delete requisition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- Tab 3: User Governance & Security -->
      @if (activeTab() === 'users') {
        <div class="users-governance-panel animate-fade-in">
          <div class="table-controls dual-controls">
            <div class="status-filters">
              <button 
                class="filter-pill" 
                [class.active]="selectedUserRole() === null" 
                (click)="filterUsersByRole(null)">
                All Accounts ({{ adminService.users().length }})
              </button>
              <button 
                class="filter-pill" 
                [class.active]="selectedUserRole() === 1" 
                (click)="filterUsersByRole(1)">
                Job Seekers
              </button>
              <button 
                class="filter-pill" 
                [class.active]="selectedUserRole() === 2" 
                (click)="filterUsersByRole(2)">
                Employers
              </button>
              <button 
                class="filter-pill" 
                [class.active]="selectedUserRole() === 3" 
                (click)="filterUsersByRole(3)">
                Administrators
              </button>
            </div>

            <div class="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                class="search-input" 
                [(ngModel)]="userSearchQuery" 
                (ngModelChange)="onUserSearchChange()"
                placeholder="Search user name or email..." />
            </div>
          </div>

          @if (adminService.loadingUsers()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Loading user directory...</span>
            </div>
          } @else if (filteredUsers().length === 0) {
            <div class="empty-state glass-panel">
              <div class="empty-icon">👥</div>
              <h3>No users found</h3>
              <p>No user accounts match the current filter or search criteria.</p>
            </div>
          } @else {
            <div class="cyber-table-container glass-panel">
              <table class="cyber-table">
                <thead>
                  <tr>
                    <th>User Member</th>
                    <th>Role</th>
                    <th>Affiliation / Activity</th>
                    <th>Registered</th>
                    <th>Security State</th>
                    <th>Access Governance</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of filteredUsers(); track user.id) {
                    <tr>
                      <td>
                        <div class="user-member-cell">
                          <div class="user-avatar-sm" [ngClass]="'role-avatar-' + user.role">
                            {{ user.firstName.charAt(0) }}
                          </div>
                          <div>
                            <span class="user-name-text">{{ user.fullName }}</span>
                            <span class="user-email-text">{{ user.email }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="role-badge" [ngClass]="getRoleBadgeClass(user.role)">
                          {{ getRoleLabel(user.role) }}
                        </span>
                      </td>
                      <td>
                        @if (user.role === 2 && user.companyName) {
                          <div class="company-admin-meta">
                            <span class="affiliation-text">
                              @if (user.companyLogoUrl) {
                                <img [src]="user.companyLogoUrl" alt="" class="table-mini-logo" />
                              } @else {
                                🏢
                              }
                              {{ user.companyName }}
                            </span>
                            @if (user.isCompanyVerified) {
                              <span class="comp-verify-pill verified" title="Company verified by platform administrator">✓ Verified</span>
                            } @else {
                              <span class="comp-verify-pill unverified" title="Company pending platform verification">Pending Admin Verification</span>
                            }
                          </div>
                        } @else if (user.role === 1) {
                          <span class="affiliation-text">📋 {{ user.applicationsCount }} applied roles</span>
                        } @else {
                          <span class="affiliation-text">—</span>
                        }
                      </td>
                      <td>
                        <span class="date-text">{{ formatDate(user.createdAtUtc) }}</span>
                      </td>
                      <td>
                        @if (user.isLocked) {
                          <span class="security-chip chip-locked">
                            🔒 Suspended / Locked
                          </span>
                        } @else {
                          <span class="security-chip chip-active">
                            ✓ Active Access
                          </span>
                        }
                      </td>
                      <td>
                        <div class="user-action-group">
                          @if (user.role !== 3) {
                            <button 
                              class="btn-row" 
                              [class.btn-unlock]="user.isLocked" 
                              [class.btn-lock]="!user.isLocked"
                              (click)="adminService.toggleUserLock(user.id).subscribe()">
                              {{ user.isLocked ? 'Restore Access' : 'Suspend Account' }}
                            </button>
                          } @else {
                            <span class="protected-badge">Protected Root Admin</span>
                          }

                          @if (user.role === 2 && user.companyId) {
                            <button 
                              class="btn-row btn-comp-verify"
                              [class.btn-comp-revoke]="user.isCompanyVerified"
                              [class.btn-comp-grant]="!user.isCompanyVerified"
                              (click)="adminService.toggleCompanyVerification(user.companyId!).subscribe()"
                              [title]="user.isCompanyVerified ? 'Revoke platform organization verification' : 'Grant verified badge to organization'">
                              {{ user.isCompanyVerified ? 'Revoke Verification' : 'Verify Company' }}
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- Tab 4: Category Taxonomy Management -->
      @if (activeTab() === 'categories') {
        <div class="categories-panel animate-fade-in">
          <div class="taxonomy-top-bar">
            <div>
              <h3 class="tab-heading">Job Classification Taxonomy</h3>
              <p class="tab-subheading">Define and manage professional disciplines used for job indexing and candidate discovery.</p>
            </div>
            <button class="btn btn-primary" (click)="showNewCategoryModal.set(true)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add New Category</span>
            </button>
          </div>

          @if (adminService.analytics()?.topCategories; as categories) {
            <div class="categories-grid">
              @for (cat of categories; track cat.id) {
                <div class="cat-card glass-panel">
                  <div class="cat-card-header">
                    <span class="cat-badge-icon">{{ cat.icon || '💼' }}</span>
                    <span class="cat-job-count">{{ cat.activeJobsCount }} active jobs</span>
                  </div>
                  <h4 class="cat-card-name">{{ cat.name }}</h4>
                  <span class="cat-card-slug">/{{ cat.slug }}</span>

                  <div class="cat-card-actions">
                    <button 
                      class="btn-cat-delete" 
                      [disabled]="cat.activeJobsCount > 0" 
                      [title]="cat.activeJobsCount > 0 ? 'Cannot delete category with active job requisitions' : 'Delete category'"
                      (click)="adminService.deleteCategory(cat.id).subscribe()">
                      Delete
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Add Category Modal Dialog -->
      @if (showNewCategoryModal()) {
        <div class="modal-backdrop" (click)="showNewCategoryModal.set(false)">
          <div class="modal-panel glass-panel-glow cat-modal" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="showNewCategoryModal.set(false)">×</button>

            <h3 class="modal-title">Create Job Category</h3>
            <p class="modal-desc">Add a new industry discipline for companies and applicants.</p>

            <div class="form-group mt-3">
              <label class="form-label">Category Name</label>
              <input type="text" class="form-input" [(ngModel)]="newCatName" placeholder="e.g. Distributed Systems & Cloud" />
            </div>

            <div class="form-group">
              <label class="form-label">URL Slug</label>
              <input type="text" class="form-input" [(ngModel)]="newCatSlug" placeholder="e.g. distributed-systems" />
            </div>

            <div class="form-group">
              <label class="form-label">Emoji / Icon Badge</label>
              <input type="text" class="form-input" [(ngModel)]="newCatIcon" placeholder="e.g. ☁️ or ⚡" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-input" rows="3" [(ngModel)]="newCatDesc" placeholder="Brief discipline description..."></textarea>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showNewCategoryModal.set(false)">Cancel</button>
              <button class="btn btn-primary" (click)="submitCreateCategory()" [disabled]="!newCatName.trim() || !newCatSlug.trim()">
                Save Category
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 6rem;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
    }

    .status-beacon-wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.25);
      margin-bottom: 0.75rem;
    }

    .beacon-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 10px #22c55e;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .beacon-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #4ade80;
      letter-spacing: 0.05em;
    }

    .page-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.025em;
    }

    .page-subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 780px;
      margin-top: 0.5rem;
    }

    .btn-refresh {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .metric-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      background: #0d1424;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .metric-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-icon-orb {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .orb-indigo { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); }
    .orb-cyan { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); }
    .orb-emerald { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); }
    .orb-purple { background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); }

    .metric-number {
      font-size: 2.5rem;
      font-weight: 800;
      color: #fff;
      line-height: 1;
    }

    .metric-sub {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
      margin-top: 0.25rem;
    }

    .sub-pill {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .pill-cyan { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .pill-indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .pill-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .pill-emerald { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
    .pill-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .pill-rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
    .sub-text { font-size: 0.78rem; color: var(--text-muted); }

    /* Tabs Strip */
    .tabs-nav-strip {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 2rem;
      overflow-x: auto;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.85rem 1.25rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-muted, #94a3b8);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: #fff;
      border-bottom-color: rgba(56, 189, 248, 0.4);
    }

    .tab-btn.active {
      color: #38bdf8;
      border-bottom-color: #38bdf8;
    }

    .tab-badge {
      font-size: 0.7rem;
      padding: 0.1rem 0.45rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    .tab-btn.active .tab-badge {
      background: rgba(56, 189, 248, 0.2);
      color: #38bdf8;
    }

    /* Dual Grid Overview */
    .overview-dual-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 900px) {
      .overview-dual-grid {
        grid-template-columns: 1fr;
      }
    }

    .section-card {
      padding: 1.75rem;
      border-radius: var(--radius-lg);
      background: #0d1424;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .section-card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }

    .section-card-desc {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      margin-bottom: 1.25rem;
    }

    /* Category Metric List */
    .categories-metric-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .category-metric-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .cat-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .cat-bar-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .cat-bar-track {
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 3px;
      overflow: hidden;
    }

    .cat-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
    }

    .cat-count {
      font-size: 0.75rem;
      color: var(--text-muted);
      min-width: 60px;
      text-align: right;
    }

    /* Activity Stream */
    .activity-stream {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .activity-node {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .node-application { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); }
    .node-job { background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); }
    .node-user { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .activity-title {
      font-size: 0.825rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .activity-time {
      font-size: 0.7rem;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .activity-desc {
      font-size: 0.75rem;
      color: var(--text-secondary);
      display: block;
      margin-top: 0.15rem;
    }

    /* Cyber Table */
    .cyber-table-container {
      border-radius: var(--radius-lg);
      background: #0d1424;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow-x: auto;
    }

    .cyber-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .cyber-table th {
      background: rgba(255, 255, 255, 0.02);
      padding: 0.85rem 1.15rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .cyber-table td {
      padding: 0.85rem 1.15rem;
      font-size: 0.825rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #f1f5f9;
      vertical-align: middle;
    }

    .table-role-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .role-title-text {
      font-weight: 600;
      color: #fff;
    }

    .company-subtext {
      font-size: 0.72rem;
      color: var(--accent-cyan);
    }

    .category-tag {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-secondary);
    }

    .remote-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      margin-left: 0.35rem;
    }

    .status-chip {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
    }

    .status-chip.published { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .status-chip.draft { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .status-chip.archived { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }

    .metrics-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .actions-cell {
      display: flex;
      gap: 0.4rem;
    }

    .btn-row {
      padding: 0.3rem 0.65rem;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .btn-publish { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.3); color: #4ade80; }
    .btn-publish:hover { background: rgba(34, 197, 94, 0.25); }
    .btn-archive { background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.3); color: #fbbf24; }
    .btn-archive:hover { background: rgba(245, 158, 11, 0.25); }
    .btn-delete { background: rgba(244, 63, 94, 0.1); border-color: rgba(244, 63, 94, 0.25); color: #fb7185; }
    .btn-delete:hover { background: rgba(244, 63, 94, 0.2); }

    /* Controls */
    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .status-filters {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .filter-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-secondary);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-pill.active {
      background: rgba(56, 189, 248, 0.15);
      border-color: #38bdf8;
      color: #38bdf8;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      color: var(--text-muted);
      min-width: 280px;
    }

    .search-input {
      background: none;
      border: none;
      color: #fff;
      font-size: 0.82rem;
      outline: none;
      width: 100%;
    }

    /* Users */
    .user-member-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
    }

    .role-avatar-1 { background: linear-gradient(135deg, #059669, #10b981); }
    .role-avatar-2 { background: linear-gradient(135deg, #4f46e5, #6366f1); }
    .role-avatar-3 { background: linear-gradient(135deg, #7c3aed, #a855f7); }

    .user-name-text { font-weight: 600; color: #fff; display: block; }
    .user-email-text { font-size: 0.72rem; color: var(--text-muted); display: block; }

    .role-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .role-seeker { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .role-employer { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .role-admin { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

    .security-chip {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .chip-active { color: #4ade80; background: rgba(34, 197, 94, 0.1); }
    .chip-locked { color: #f87171; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); }

    .btn-lock { background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.3); color: #f87171; }
    .btn-lock:hover { background: rgba(239, 68, 68, 0.25); }
    .btn-unlock { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.3); color: #4ade80; }
    .btn-unlock:hover { background: rgba(34, 197, 94, 0.25); }
    .protected-badge { font-size: 0.72rem; color: var(--text-muted); font-style: italic; }

    .company-admin-meta {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .table-mini-logo {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      object-fit: contain;
      background: #ffffff;
      padding: 1px;
      vertical-align: middle;
      display: inline-block;
      margin-right: 0.35rem;
    }
    .comp-verify-pill {
      display: inline-block;
      width: fit-content;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .comp-verify-pill.verified {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }
    .comp-verify-pill.unverified {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }
    .user-action-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .btn-comp-verify {
      font-size: 0.72rem;
      padding: 0.3rem 0.6rem;
      font-weight: 600;
    }
    .btn-comp-grant {
      background: rgba(14, 165, 233, 0.15);
      border-color: rgba(14, 165, 233, 0.35);
      color: #38bdf8;
    }
    .btn-comp-grant:hover {
      background: rgba(14, 165, 233, 0.28);
    }
    .btn-comp-revoke {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .btn-comp-revoke:hover {
      background: rgba(239, 68, 68, 0.25);
    }

    /* Categories Panel */
    .taxonomy-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .tab-heading { font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0; }
    .tab-subheading { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem; }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .cat-card {
      padding: 1.25rem;
      border-radius: var(--radius-md);
      background: #0d1424;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .cat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cat-badge-icon { font-size: 1.5rem; }
    .cat-job-count { font-size: 0.72rem; font-weight: 600; color: var(--accent-cyan); background: rgba(56, 189, 248, 0.1); padding: 0.15rem 0.45rem; border-radius: 4px; }
    .cat-card-name { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; }
    .cat-card-slug { font-size: 0.72rem; color: var(--text-muted); font-family: monospace; }

    .cat-card-actions {
      margin-top: 0.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn-cat-delete {
      background: none;
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #f87171;
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-cat-delete:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-cat-delete:not(:disabled):hover {
      background: rgba(239, 68, 68, 0.2);
    }

    /* Modals */
    .cat-modal { max-width: 480px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; color: #fff; }
    .modal-desc { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  public readonly adminService = inject(AdminService);
  public readonly auth = inject(AuthService);

  public readonly activeTab = signal<'overview' | 'jobs' | 'users' | 'categories'>('overview');
  public readonly selectedJobStatus = signal<number | null>(null);
  public readonly selectedUserRole = signal<number | null>(null);
  public userSearchQuery = '';

  // New Category Modal
  public readonly showNewCategoryModal = signal<boolean>(false);
  public newCatName = '';
  public newCatSlug = '';
  public newCatIcon = '';
  public newCatDesc = '';

  // Filtered Users computed
  public readonly filteredUsers = computed(() => {
    let list = this.adminService.users();
    const role = this.selectedUserRole();
    if (role !== null) {
      list = list.filter((u) => u.role === role);
    }
    const q = this.userSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          (u.companyName && u.companyName.toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.adminService.loadAnalytics().subscribe();
    this.adminService.loadJobs().subscribe();
    this.adminService.loadUsers().subscribe();
  }

  onSelectJobsTab(): void {
    this.activeTab.set('jobs');
    if (this.adminService.jobs().length === 0) {
      this.adminService.loadJobs().subscribe();
    }
  }

  onSelectUsersTab(): void {
    this.activeTab.set('users');
    if (this.adminService.users().length === 0) {
      this.adminService.loadUsers().subscribe();
    }
  }

  filterJobsByStatus(status: number | null): void {
    this.selectedJobStatus.set(status);
    this.adminService.loadJobs(status ?? undefined).subscribe();
  }

  filterUsersByRole(role: number | null): void {
    this.selectedUserRole.set(role);
  }

  onUserSearchChange(): void {
    // Computed automatically reacts to userSearchQuery changes
  }

  confirmDeleteJob(jobId: string, title: string): void {
    if (confirm(`Are you sure you want to delete requisition '${title}'? This will remove it from the platform.`)) {
      this.adminService.deleteJob(jobId).subscribe();
    }
  }

  submitCreateCategory(): void {
    if (!this.newCatName.trim() || !this.newCatSlug.trim()) return;

    this.adminService.createCategory({
      name: this.newCatName.trim(),
      slug: this.newCatSlug.trim(),
      icon: this.newCatIcon.trim() || undefined,
      description: this.newCatDesc.trim() || undefined
    }).subscribe({
      next: () => {
        this.showNewCategoryModal.set(false);
        this.newCatName = '';
        this.newCatSlug = '';
        this.newCatIcon = '';
        this.newCatDesc = '';
      }
    });
  }

  getCategoryPercentage(active: number, totalPublished: number): number {
    if (!totalPublished || totalPublished <= 0) return 0;
    return Math.min(100, Math.round((active / totalPublished) * 100));
  }

  getStatusChipClass(status: number): string {
    switch (status) {
      case 2: return 'published';
      case 1: return 'draft';
      case 3: return 'archived';
      default: return '';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Draft';
      case 2: return 'Published';
      case 3: return 'Archived';
      case 4: return 'Closed';
      default: return 'Active';
    }
  }

  getRoleBadgeClass(role: number): string {
    switch (role) {
      case 1: return 'role-seeker';
      case 2: return 'role-employer';
      case 3: return 'role-admin';
      default: return '';
    }
  }

  getRoleLabel(role: number): string {
    switch (role) {
      case 1: return 'Job Seeker';
      case 2: return 'Employer';
      case 3: return 'Admin';
      default: return 'Member';
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
}
