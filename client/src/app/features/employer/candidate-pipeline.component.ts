import { Component, inject, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmployerService } from '../../core/services/employer.service';
import { EmployerApplicant } from '../../core/models/employer.model';

@Component({
  selector: 'app-candidate-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pipeline-container">
      <!-- Top Bar -->
      <div class="pipeline-header">
        <div>
          <button class="back-link" (click)="backToDashboard.emit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>
          <h2 class="pipeline-title">Candidate Review Pipeline</h2>
          <p class="pipeline-subtitle">
            Screen candidates, move applicants through stages, and record internal interview feedback.
          </p>
        </div>

        <div class="filter-controls">
          <label class="filter-label">Filter by Position:</label>
          <select 
            class="job-select-input" 
            [value]="selectedJobId() ?? ''" 
            (change)="onJobFilterChange($event)">
            <option value="">All Requisitions ({{ employerService.applicants().length }} applicants)</option>
            @for (job of employerService.jobs(); track job.id) {
              <option [value]="job.id">{{ job.title }}</option>
            }
          </select>

          <button 
            type="button" 
            class="btn-sort-score" 
            [class.active]="sortByScore()" 
            (click)="toggleSortByScore()"
            title="Sort applicants by AI compatibility score">
            <span class="sparkle-icon">⚡</span>
            <span>Sort by Match Score</span>
          </button>

          @if (selectedJobId()) {
            <button 
              type="button" 
              class="btn-batch-ai" 
              (click)="runBatchAiScoring()"
              title="Run automated AI screening on all applicants for this position">
              <span class="sparkle-icon">✨</span>
              <span>Bulk AI Screening</span>
            </button>
          }
        </div>
      </div>

      <!-- Kanban Pipeline Columns -->
      @if (employerService.loadingApplicants()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading applicants pipeline...</span>
        </div>
      } @else if (employerService.applicants().length === 0) {
        <div class="empty-state glass-panel">
          <div class="empty-icon">👥</div>
          <h3>No candidates have applied yet</h3>
          <p>Once job seekers submit applications for your open positions, they will appear in this review pipeline.</p>
          <button class="btn btn-secondary mt-3" (click)="backToDashboard.emit()">Return to Dashboard</button>
        </div>
      } @else {
        <div class="kanban-board">
          @for (column of stageColumns; track column.status) {
            <div class="kanban-column glass-panel">
              <div class="column-header" [ngClass]="column.headerClass">
                <div class="col-title-wrap">
                  <span class="col-icon">{{ column.icon }}</span>
                  <span class="col-name">{{ column.label }}</span>
                </div>
                <span class="col-count">{{ getApplicantsForStage(column.status).length }}</span>
              </div>

              <div class="column-cards-stream">
                @for (applicant of getApplicantsForStage(column.status); track applicant.applicationId) {
                  <article class="candidate-card">
                    <!-- Candidate Header -->
                    <div class="card-head">
                      <div class="cand-avatar">{{ applicant.candidateName.charAt(0) }}</div>
                      <div class="cand-meta">
                        <h4 class="cand-name">{{ applicant.candidateName }}</h4>
                        <span class="cand-email">{{ applicant.candidateEmail }}</span>
                      </div>
                    </div>

                    <!-- Role Badge -->
                    <div class="cand-role-pill">
                      <span>{{ applicant.jobTitle }}</span>
                    </div>

                    <!-- AI Compatibility Match Badge -->
                    <div class="ai-badge-row">
                      @if (applicant.aiMatchScore !== null && applicant.aiMatchScore !== undefined) {
                        <div class="card-ai-badge" 
                             [class.high-match]="applicant.aiMatchScore >= 75" 
                             [class.mid-match]="applicant.aiMatchScore >= 50 && applicant.aiMatchScore < 75"
                             [class.low-match]="applicant.aiMatchScore < 50"
                             title="AI Resume Match & Compatibility Score">
                          <span class="sparkle">✨</span>
                          <span class="score-text">{{ applicant.aiMatchScore }}% Match</span>
                        </div>
                      } @else {
                        <button type="button" class="btn-card-score-ai" (click)="triggerScore(applicant, $event)" title="Run AI compatibility evaluation">
                          <span>✨ Score with AI</span>
                        </button>
                      }
                    </div>

                    <!-- Applied Date -->
                    <div class="applied-date-row">
                      <span>Applied {{ formatDate(applicant.appliedAtUtc) }}</span>
                    </div>

                    <!-- Resume Review Trigger -->
                    @if (applicant.resumeUrl) {
                      <button type="button" class="resume-btn" (click)="openResumePreview(applicant)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        <span>Review CV / Resume</span>
                      </button>
                    }

                    <!-- Cover Letter Snippet -->
                    @if (applicant.coverLetter) {
                      <div class="cover-letter-box">
                        <span class="cover-label">Candidate Note:</span>
                        <p class="cover-text">{{ applicant.coverLetter }}</p>
                      </div>
                    }

                    <!-- Current Feedback Notes -->
                    @if (applicant.employerNotes) {
                      <div class="internal-notes-box">
                        <span class="note-label">Review Feedback:</span>
                        <p class="note-text">{{ applicant.employerNotes }}</p>
                      </div>
                    }

                    <!-- Actions Row -->
                    <div class="card-actions">
                      <div class="stage-mover">
                        <label class="action-label">Move Stage:</label>
                        <select 
                          class="stage-select" 
                          [value]="applicant.status" 
                          (change)="onStageChange(applicant.applicationId, $event)">
                          <option [value]="1" [selected]="applicant.status === 1">Submitted</option>
                          <option [value]="2" [selected]="applicant.status === 2">In Review</option>
                          <option [value]="3" [selected]="applicant.status === 3">Shortlisted</option>
                          <option [value]="4" [selected]="applicant.status === 4">Interview</option>
                          <option [value]="5" [selected]="applicant.status === 5">Hired / Offer</option>
                          <option [value]="6" [selected]="applicant.status === 6">Declined</option>
                        </select>
                      </div>

                      <div class="card-action-btns">
                        <button class="btn-note-toggle" (click)="openNoteModal(applicant)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Feedback
                        </button>

                        <a class="btn-email-candidate" [href]="'mailto:' + applicant.candidateEmail + '?subject=Application update for ' + applicant.jobTitle" title="Email candidate directly">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          Email
                        </a>
                      </div>
                    </div>
                  </article>
                } @empty {
                  <div class="col-empty-placeholder">
                    <span>No candidates in this stage</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Add Note / Feedback Dialog -->
      @if (activeNoteApplicant(); as target) {
        <div class="modal-backdrop" (click)="activeNoteApplicant.set(null)">
          <div class="modal-panel glass-panel-glow note-modal" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="activeNoteApplicant.set(null)">×</button>

            <h3 class="note-modal-title">Review Feedback for {{ target.candidateName }}</h3>
            <p class="note-modal-desc">Role: {{ target.jobTitle }}</p>

            <div class="form-group mt-3">
              <label class="form-label">Internal Recruiter / Hiring Feedback</label>
              <textarea 
                class="form-input" 
                rows="4" 
                [(ngModel)]="tempNote" 
                placeholder="e.g. Completed technical screening. Strong system design knowledge, advancing to hiring manager round."></textarea>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="activeNoteApplicant.set(null)">Cancel</button>
              <button class="btn btn-primary" (click)="saveFeedbackNote(target.applicationId, target.status)">
                Save Feedback
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Resume Document Inspection Window -->
      @if (activeResumeApplicant(); as cand) {
        <div class="modal-backdrop" (click)="activeResumeApplicant.set(null)">
          <div class="modal-panel glass-panel-glow resume-preview-modal" (click)="$event.stopPropagation()">
            <div class="resume-modal-header">
              <div class="resume-cand-info">
                <div class="cand-avatar-lg">{{ cand.candidateName.charAt(0) }}</div>
                <div>
                  <h3 class="preview-title">{{ cand.candidateName }}</h3>
                  <div class="preview-meta">
                    <span class="preview-role">{{ cand.jobTitle }}</span>
                    <span class="dot-sep">•</span>
                    <span class="preview-email">{{ cand.candidateEmail }}</span>
                    <span class="dot-sep">•</span>
                    <span>Applied {{ formatDate(cand.appliedAtUtc) }}</span>
                  </div>
                </div>
              </div>

              <div class="preview-header-actions">
                <a [href]="cand.resumeUrl" target="_blank" rel="noopener noreferrer" class="btn-external-doc" title="Open document in dedicated tab">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  <span>Open Full Doc</span>
                </a>
                <button class="close-btn" (click)="activeResumeApplicant.set(null)">×</button>
              </div>
            </div>

            @if (cand.coverLetter) {
              <div class="preview-cover-note">
                <span class="cover-tag">Candidate Note:</span>
                <span class="cover-quote">"{{ cand.coverLetter }}"</span>
              </div>
            }

            <!-- AI ATS Compatibility Intelligence Panel -->
            @if (cand.aiMatchScore !== null && cand.aiMatchScore !== undefined) {
              <div class="ai-analysis-banner">
                <div class="ai-score-ring-wrap">
                  <div class="score-circle" 
                       [class.score-high]="cand.aiMatchScore >= 75"
                       [class.score-mid]="cand.aiMatchScore >= 50 && cand.aiMatchScore < 75"
                       [class.score-low]="cand.aiMatchScore < 50">
                    <span class="score-number">{{ cand.aiMatchScore }}%</span>
                    <span class="score-label">Match</span>
                  </div>
                </div>

                <div class="ai-analysis-details">
                  <div class="ai-scores-row">
                    <div class="sub-metric">
                      <span class="metric-title">Skills Fit:</span>
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill skills" [style.width.%]="cand.aiSkillsScore || 0"></div>
                      </div>
                      <span class="metric-val">{{ cand.aiSkillsScore }}%</span>
                    </div>

                    <div class="sub-metric">
                      <span class="metric-title">Experience:</span>
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill exp" [style.width.%]="cand.aiExperienceScore || 0"></div>
                      </div>
                      <span class="metric-val">{{ cand.aiExperienceScore }}%</span>
                    </div>

                    <button type="button" class="btn-rescore-ai" (click)="triggerScore(cand)">
                      <span>⚡ Re-Analyze</span>
                    </button>
                  </div>

                  <div class="ai-recommendation-box">
                    <span class="rec-badge">Recommendation:</span>
                    <span class="rec-text">{{ cand.aiRecommendation }}</span>
                  </div>

                  <!-- Strengths & Missing Skills -->
                  <div class="ai-breakdown-grid">
                    @if (cand.aiStrengths && parseArray(cand.aiStrengths).length > 0) {
                      <div class="breakdown-col strengths-col">
                        <span class="breakdown-label">Key Strengths:</span>
                        <ul class="strengths-list">
                          @for (st of parseArray(cand.aiStrengths); track st) {
                            <li>{{ st }}</li>
                          }
                        </ul>
                      </div>
                    }

                    @if (cand.aiMissingSkills && parseArray(cand.aiMissingSkills).length > 0) {
                      <div class="breakdown-col missing-col">
                        <span class="breakdown-label">Skill Gaps:</span>
                        <div class="missing-tags">
                          @for (sk of parseArray(cand.aiMissingSkills); track sk) {
                            <span class="missing-tag">{{ sk }}</span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            } @else {
              <div class="unscored-prompt-bar">
                <span class="unscored-text">⚡ Candidate has not been scored by the AI Match Engine yet.</span>
                <button type="button" class="btn-run-ai-scan" (click)="triggerScore(cand)">
                  <span>Run AI Compatibility Analysis</span>
                </button>
              </div>
            }

            <div class="resume-document-viewport">
              @if (cand.resumeUrl) {
                <iframe 
                  [src]="sanitizedResumeUrl()" 
                  class="embedded-pdf-frame" 
                  title="Candidate Resume Preview">
                </iframe>
              }
            </div>

            <div class="resume-modal-footer">
              <div class="footer-stage-controls">
                <span class="footer-label">Update Stage:</span>
                <select 
                  class="stage-select-footer" 
                  [value]="cand.status" 
                  (change)="onStageChange(cand.applicationId, $event); cand.status = +$any($event.target).value">
                  <option [value]="1" [selected]="cand.status === 1">1. Submitted</option>
                  <option [value]="2" [selected]="cand.status === 2">2. In Review</option>
                  <option [value]="3" [selected]="cand.status === 3">3. Shortlisted</option>
                  <option [value]="4" [selected]="cand.status === 4">4. Interview</option>
                  <option [value]="5" [selected]="cand.status === 5">5. Hired / Offer</option>
                  <option [value]="6" [selected]="cand.status === 6">6. Declined</option>
                </select>
              </div>

              <div class="footer-actions">
                <button class="btn btn-secondary" (click)="activeResumeApplicant.set(null)">Done</button>
                <button class="btn btn-primary" (click)="openNoteModal(cand); activeResumeApplicant.set(null)">
                  Add Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .pipeline-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 5rem;
    }
    .pipeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
    }
    .back-link {
      background: none;
      border: none;
      color: var(--accent-cyan);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
      padding: 0;
      transition: color var(--transition-fast);
    }
    .back-link:hover {
      color: #fff;
    }
    .pipeline-title {
      font-size: 2.15rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.025em;
    }
    .pipeline-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 0.4rem;
      max-width: 620px;
    }
    .filter-controls {
      display: flex;
      align-items: flex-end;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .filter-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .job-select-input {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      min-width: 260px;
      outline: none;
      transition: all var(--transition-fast);
    }
    .job-select-input:hover, .job-select-input:focus {
      border-color: var(--accent-primary);
    }
    .job-select-input option {
      background: var(--bg-card);
      color: var(--text-primary);
    }
    .btn-sort-score, .btn-batch-ai {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-md);
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-fast);
      height: 38px;
    }
    .btn-sort-score:hover, .btn-batch-ai:hover {
      background: rgba(99, 102, 241, 0.25);
      color: #fff;
      border-color: rgba(99, 102, 241, 0.6);
    }
    .btn-sort-score.active {
      background: var(--gradient-brand);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
    }
    .sparkle-icon {
      font-size: 0.9rem;
    }
    /* Kanban Board */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(6, minmax(220px, 1fr));
      gap: 1rem;
      align-items: start;
      overflow-x: auto;
      padding-bottom: 1.5rem;
    }
    .kanban-column {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      min-height: 480px;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--border-subtle);
      margin-bottom: 1rem;
    }
    .col-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .col-icon {
      font-size: 0.9rem;
    }
    .col-name {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: 0.02em;
    }
    .col-count {
      background: rgba(255, 255, 255, 0.08);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }
    .header-submitted { border-bottom-color: #38bdf8; }
    .header-review { border-bottom-color: #c084fc; }
    .header-shortlisted { border-bottom-color: #2dd4bf; }
    .header-interview { border-bottom-color: #818cf8; }
    .header-hired { border-bottom-color: #34d399; }
    .header-declined { border-bottom-color: #fb7185; }

    .column-cards-stream {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      flex: 1;
    }
    .candidate-card {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-md);
      padding: 1rem;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }
    .candidate-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .card-head {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .cand-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-indigo);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cand-meta {
      overflow: hidden;
    }
    .cand-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cand-email {
      font-size: 0.725rem;
      color: var(--text-muted);
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cand-role-pill {
      margin-top: 0.6rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.725rem;
      color: var(--accent-cyan);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .applied-date-row {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 0.4rem;
      font-family: var(--font-mono);
    }
    .ai-badge-row {
      margin-top: 0.4rem;
    }
    .card-ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-full);
      font-size: 0.72rem;
      font-weight: 700;
      font-family: var(--font-mono);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .card-ai-badge.high-match {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
    }
    .card-ai-badge.mid-match {
      background: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.4);
    }
    .card-ai-badge.low-match {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }
    .btn-card-score-ai {
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      color: #a5b4fc;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-card-score-ai:hover {
      background: rgba(99, 102, 241, 0.25);
      color: #fff;
      border-color: rgba(99, 102, 241, 0.5);
    }
    .resume-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--accent-indigo);
      font-size: 0.775rem;
      font-weight: 600;
      margin-top: 0.65rem;
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .resume-btn:hover {
      color: #fff;
    }
    .cover-letter-box {
      margin-top: 0.65rem;
      background: rgba(255, 255, 255, 0.02);
      border-left: 2px solid var(--accent-indigo);
      padding: 0.4rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .cover-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      display: block;
    }
    .cover-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-top: 0.15rem;
    }
    .internal-notes-box {
      margin-top: 0.65rem;
      background: rgba(20, 184, 166, 0.08);
      border-left: 2px solid var(--accent-cyan);
      padding: 0.4rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .note-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--accent-cyan);
      text-transform: uppercase;
      display: block;
    }
    .note-text {
      font-size: 0.75rem;
      color: var(--text-primary);
      line-height: 1.4;
      margin-top: 0.15rem;
    }
    .card-actions {
      margin-top: 0.85rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .stage-mover {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .action-label {
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
    }
    .stage-select {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      font-size: 0.775rem;
      font-weight: 600;
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      outline: none;
      transition: all var(--transition-fast);
    }
    .stage-select:hover, .stage-select:focus {
      border-color: var(--accent-primary);
    }
    .stage-select option {
      background: var(--bg-card);
      color: var(--text-primary);
    }
    .btn-note-toggle {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.725rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      cursor: pointer;
      padding: 0.2rem 0;
      transition: color var(--transition-fast);
    }
    .btn-note-toggle:hover {
      color: var(--accent-cyan);
    }
    .card-action-btns {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-top: 0.15rem;
    }
    .btn-email-candidate {
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      color: var(--accent-indigo);
      font-size: 0.725rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      cursor: pointer;
      padding: 0.25rem 0.55rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .btn-email-candidate:hover {
      background: var(--accent-indigo);
      color: #fff;
      border-color: var(--accent-indigo);
    }
    .col-empty-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100px;
      color: rgba(255, 255, 255, 0.2);
      font-size: 0.75rem;
      text-align: center;
      border: 1px dashed rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-md);
    }
    .note-modal {
      max-width: 520px;
    }
    .note-modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
    }
    .note-modal-desc {
      font-size: 0.85rem;
      color: var(--accent-cyan);
      margin-top: 0.2rem;
    }
    /* Resume Preview Modal */
    .resume-preview-modal {
      max-width: 960px;
      height: 88vh;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      gap: 1rem;
    }
    .resume-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .resume-cand-info {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .cand-avatar-lg {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-indigo), var(--accent-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
    }
    .preview-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .preview-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }
    .preview-role {
      color: var(--accent-cyan);
      font-weight: 600;
    }
    .preview-header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn-external-doc {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius-sm);
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-external-doc:hover {
      background: rgba(56, 189, 248, 0.25);
      color: #7dd3fc;
    }
    .preview-cover-note {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      padding: 0.6rem 0.85rem;
      background: rgba(15, 23, 42, 0.6);
      border-left: 3px solid var(--accent-cyan);
      border-radius: 4px;
      font-size: 0.78rem;
    }
    .cover-tag {
      font-weight: 700;
      color: var(--accent-cyan);
      flex-shrink: 0;
    }
    .cover-quote {
      color: var(--text-secondary);
      font-style: italic;
    }
    /* AI ATS Modal Panel */
    .ai-analysis-banner {
      background: rgba(13, 20, 36, 0.9);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem;
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .ai-score-ring-wrap {
      flex-shrink: 0;
    }
    .score-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #070b14;
      border: 3px solid var(--accent-indigo);
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
    }
    .score-circle.score-high {
      border-color: #10b981;
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
    }
    .score-circle.score-mid {
      border-color: #0ea5e9;
      box-shadow: 0 0 16px rgba(14, 165, 233, 0.4);
    }
    .score-circle.score-low {
      border-color: #f59e0b;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);
    }
    .score-number {
      font-size: 1.15rem;
      font-weight: 800;
      color: #fff;
      line-height: 1;
    }
    .score-label {
      font-size: 0.6rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .ai-analysis-details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .ai-scores-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .sub-metric {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .metric-title {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .progress-bar-track {
      width: 80px;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: var(--radius-full);
    }
    .progress-bar-fill.skills {
      background: linear-gradient(90deg, #6366f1, #38bdf8);
    }
    .progress-bar-fill.exp {
      background: linear-gradient(90deg, #10b981, #06b6d4);
    }
    .metric-val {
      font-size: 0.72rem;
      font-weight: 700;
      font-family: var(--font-mono);
      color: #fff;
    }
    .btn-rescore-ai {
      background: none;
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      margin-left: auto;
      transition: all var(--transition-fast);
    }
    .btn-rescore-ai:hover {
      background: rgba(99, 102, 241, 0.2);
      color: #fff;
    }
    .ai-recommendation-box {
      font-size: 0.78rem;
      line-height: 1.4;
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }
    .rec-badge {
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--accent-cyan);
      background: rgba(14, 165, 233, 0.12);
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-sm);
    }
    .rec-text {
      color: #e2e8f0;
      font-weight: 500;
    }
    .ai-breakdown-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 0.25rem;
    }
    .breakdown-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 0.25rem;
      display: block;
    }
    .strengths-list {
      margin: 0;
      padding-left: 1.1rem;
      font-size: 0.74rem;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .missing-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .missing-tag {
      font-size: 0.65rem;
      font-family: var(--font-mono);
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fda4af;
      font-weight: 600;
    }
    .unscored-prompt-bar {
      padding: 0.85rem 1.25rem;
      background: rgba(99, 102, 241, 0.08);
      border: 1px dashed rgba(99, 102, 241, 0.3);
      border-radius: var(--radius-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .unscored-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .btn-run-ai-scan {
      background: var(--gradient-brand);
      color: #fff;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .resume-document-viewport {
      flex: 1;
      min-height: 400px;
      background: #0f172a;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .embedded-pdf-frame {
      width: 100%;
      height: 100%;
      border: none;
    }
    .resume-modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
    }
    .footer-stage-controls {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .footer-label {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .stage-select-footer {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      outline: none;
      transition: all var(--transition-fast);
    }
    .stage-select-footer:hover, .stage-select-footer:focus {
      border-color: var(--accent-primary);
    }
    .stage-select-footer option {
      background: var(--bg-card);
      color: var(--text-primary);
    }
    .footer-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .loading-state, .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      border-radius: var(--radius-xl);
    }
  `]
})
export class CandidatePipelineComponent {
  private readonly sanitizer = inject(DomSanitizer);
  public readonly employerService = inject(EmployerService);
  public readonly backToDashboard = output<void>();

  public readonly selectedJobId = signal<string | null>(null);
  public readonly activeNoteApplicant = signal<EmployerApplicant | null>(null);
  public readonly activeResumeApplicant = signal<EmployerApplicant | null>(null);
  public tempNote = '';

  public readonly sanitizedResumeUrl = computed<SafeResourceUrl | null>(() => {
    const applicant = this.activeResumeApplicant();
    if (!applicant?.resumeUrl) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(applicant.resumeUrl);
  });

  public readonly stageColumns = [
    { status: 1, label: 'Submitted', icon: '📥', headerClass: 'header-submitted' },
    { status: 2, label: 'In Review', icon: '🧐', headerClass: 'header-review' },
    { status: 3, label: 'Shortlisted', icon: '⭐', headerClass: 'header-shortlisted' },
    { status: 4, label: 'Interview', icon: '🎙️', headerClass: 'header-interview' },
    { status: 5, label: 'Hired / Offer', icon: '🎉', headerClass: 'header-hired' },
    { status: 6, label: 'Declined', icon: '🚫', headerClass: 'header-declined' }
  ];

  ngOnInit(): void {
    this.employerService.loadApplicants(this.selectedJobId() ?? undefined).subscribe();
  }

  getApplicantsForStage(stageStatus: number): EmployerApplicant[] {
    return this.employerService.applicants().filter((a) => a.status === stageStatus);
  }

  onJobFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const val = select.value || null;
    this.selectedJobId.set(val);
    this.employerService.loadApplicants(val ?? undefined).subscribe();
  }

  onStageChange(applicationId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = parseInt(select.value, 10);
    this.employerService.updateApplicantStage(applicationId, newStatus).subscribe();
  }

  openNoteModal(applicant: EmployerApplicant): void {
    this.activeNoteApplicant.set(applicant);
    this.tempNote = applicant.employerNotes || '';
  }

  openResumePreview(applicant: EmployerApplicant): void {
    this.activeResumeApplicant.set(applicant);
  }

  saveFeedbackNote(applicationId: string, currentStatus: number): void {
    if (!this.tempNote.trim()) return;
    this.employerService.updateApplicantStage(applicationId, currentStatus, this.tempNote.trim()).subscribe({
      next: () => {
        this.activeNoteApplicant.set(null);
      }
    });
  }

  public readonly sortByScore = signal<boolean>(false);
  public readonly isScoringId = signal<string | null>(null);
  public readonly isBatchScoring = signal<boolean>(false);

  toggleSortByScore(): void {
    this.sortByScore.set(!this.sortByScore());
    this.employerService.loadApplicants(this.selectedJobId() ?? undefined, this.sortByScore()).subscribe();
  }

  triggerScore(applicant: EmployerApplicant, event?: Event): void {
    if (event) event.stopPropagation();
    this.isScoringId.set(applicant.applicationId);
    this.employerService.scoreApplicant(applicant.applicationId).subscribe({
      next: (res) => {
        applicant.aiMatchScore = res.matchScore;
        applicant.aiSkillsScore = res.skillsScore;
        applicant.aiExperienceScore = res.experienceScore;
        applicant.aiStrengths = JSON.stringify(res.strengths);
        applicant.aiMissingSkills = JSON.stringify(res.missingSkills);
        applicant.aiRecommendation = res.recommendation;
        applicant.aiScoredAtUtc = new Date().toISOString();
        this.isScoringId.set(null);
      },
      error: () => {
        this.isScoringId.set(null);
      }
    });
  }

  runBatchAiScoring(): void {
    const jId = this.selectedJobId();
    if (!jId) return;
    this.isBatchScoring.set(true);
    this.employerService.batchScoreApplicants(jId).subscribe({
      next: () => {
        this.employerService.loadApplicants(jId, this.sortByScore()).subscribe();
        this.isBatchScoring.set(false);
      },
      error: () => {
        this.isBatchScoring.set(false);
      }
    });
  }

  parseArray(jsonStr?: string): string[] {
    if (!jsonStr) return [];
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }
}
