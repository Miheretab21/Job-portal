import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployerService } from '../../core/services/employer.service';
import { JobService } from '../../core/services/job.service';
import { ApiService } from '../../core/services/api.service';
import { CreateJobPayload } from '../../core/models/employer.model';

@Component({
  selector: 'app-post-job-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-panel glass-panel-glow" (click)="$event.stopPropagation()">
        <!-- Close Button -->
        <button class="close-btn" (click)="close.emit()" aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div class="modal-header">
          <div class="header-icon">{{ editJobId() ? '✏️' : '🚀' }}</div>
          <div>
            <h2 class="modal-title">{{ editJobId() ? 'Edit Job Requisition' : 'Publish Job Requisition' }}</h2>
            <p class="modal-subtitle">
              {{ editJobId() ? 'Update requirements, compensation, and details for this listing.' : 'Create a high-conviction engineering listing to attract top talent.' }}
            </p>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">
            {{ errorMessage() }}
          </div>
        }

        <form class="job-form" (ngSubmit)="submitJob()">
          <!-- Title -->
          <div class="form-group">
            <label class="form-label">Job Title <span class="req">*</span></label>
            <input 
              type="text" 
              class="form-input" 
              [(ngModel)]="title" 
              name="title" 
              required 
              placeholder="e.g. Senior Distributed Systems Engineer (.NET 10 / Cloud)" />
          </div>

          <!-- Category & Type Grid -->
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Category <span class="req">*</span></label>
              <select class="form-input" [(ngModel)]="categoryId" name="categoryId" required>
                <option value="" disabled selected>Select category...</option>
                @for (cat of jobService.categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Employment Type <span class="req">*</span></label>
              <select class="form-input" [(ngModel)]="jobType" name="jobType">
                <option [value]="1">Full-time</option>
                <option [value]="3">Contract</option>
                <option [value]="2">Part-time</option>
                <option [value]="5">Internship</option>
              </select>
            </div>
          </div>

          <!-- Location & Remote -->
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="location" 
                name="location" 
                placeholder="e.g. San Francisco, CA or Remote" />
            </div>

            <div class="form-group flex-center-group">
              <label class="toggle-control mt-4">
                <input type="checkbox" [(ngModel)]="isRemote" name="isRemote" />
                <span class="toggle-slider"></span>
                <span class="toggle-label">100% Remote Position</span>
              </label>
            </div>
          </div>

          <!-- Salary Range & Experience -->
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">Salary Min</label>
              <input 
                type="number" 
                class="form-input" 
                [(ngModel)]="salaryMin" 
                name="salaryMin" 
                placeholder="140000" />
            </div>

            <div class="form-group">
              <label class="form-label">Salary Max</label>
              <input 
                type="number" 
                class="form-input" 
                [(ngModel)]="salaryMax" 
                name="salaryMax" 
                placeholder="195000" />
            </div>

            <div class="form-group">
              <label class="form-label">Experience Level</label>
              <select class="form-input" [(ngModel)]="experienceLevel" name="experienceLevel">
                <option [value]="1">Entry Level</option>
                <option [value]="2">Mid Level</option>
                <option [value]="3">Senior</option>
                <option [value]="4">Lead / Staff</option>
              </select>
            </div>
          </div>

          <!-- Skills Tags -->
          <div class="form-group">
            <label class="form-label">Required Skills & Technologies (press Enter or comma to add)</label>
            <div class="skills-input-box">
              <div class="tags-strip">
                @for (skill of skills(); track skill) {
                  <span class="skill-tag">
                    {{ skill }}
                    <button type="button" class="del-tag-btn" (click)="removeSkill(skill)">×</button>
                  </span>
                }
              </div>
              <input 
                type="text" 
                class="tag-field" 
                [(ngModel)]="skillInput" 
                name="skillInput" 
                placeholder="Type skill & press Enter..." 
                (keydown)="onSkillKeyDown($event)" />
            </div>

            <!-- Quick Suggestions -->
            <div class="quick-skills-row">
              <span class="quick-title">Quick add:</span>
              @for (s of popularSkills; track s) {
                @if (!hasSkill(s)) {
                  <button type="button" class="quick-skill-pill" (click)="addSkill(s)">+ {{ s }}</button>
                }
              }
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Role Description <span class="req">*</span></label>
            <textarea 
              class="form-input" 
              rows="4" 
              [(ngModel)]="description" 
              name="description" 
              required 
              placeholder="Describe the mission, impact, day-to-day responsibilities, and team culture..."></textarea>
          </div>

          <!-- Requirements -->
          <div class="form-group">
            <label class="form-label">Key Requirements</label>
            <textarea 
              class="form-input" 
              rows="3" 
              [(ngModel)]="requirements" 
              name="requirements" 
              placeholder="- 5+ years of software architecture experience&#10;- Proficiency with .NET Core, C#, EF Core&#10;- Experience designing distributed systems..."></textarea>
          </div>

          <!-- Benefits -->
          <div class="form-group">
            <label class="form-label">Benefits & Perks</label>
            <textarea 
              class="form-input" 
              rows="2" 
              [(ngModel)]="benefits" 
              name="benefits" 
              placeholder="- Top-tier healthcare & pension plan&#10;- Transportation allowance & mobile phone budget..."></textarea>
          </div>

          <!-- Organization Profile Details (Saved with company profile) -->
          <div class="company-section-divider">
            <span class="divider-label">🏢 Organization Details (Appears on Job Detail)</span>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Industry</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="companyIndustry" 
                name="companyIndustry" 
                placeholder="e.g. Financial Technology, Banking, Telecommunications" />
            </div>

            <div class="form-group">
              <label class="form-label">Company Size</label>
              <select class="form-input" [(ngModel)]="companySize" name="companySize">
                <option value="">Select size...</option>
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="201-500 employees">201-500 employees</option>
                <option value="500+ employees">500+ employees</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Company Website</label>
            <input 
              type="url" 
              class="form-input" 
              [(ngModel)]="companyWebsite" 
              name="companyWebsite" 
              placeholder="https://yourcompany.et" />
          </div>

          <div class="form-group">
            <label class="form-label">Company Overview / About the Organization</label>
            <textarea 
              class="form-input" 
              rows="3" 
              [(ngModel)]="companyDescription" 
              name="companyDescription" 
              placeholder="Provide a short overview of your organization's mission, values, and work culture..."></textarea>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="close.emit()" [disabled]="submitting()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              {{ submitting() ? (editJobId() ? 'Saving Changes...' : 'Publishing Listing...') : (editJobId() ? 'Save Changes' : 'Publish Job Listing') }}
            </button>
          </div>
        </form>
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
      max-width: 780px;
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
      width: 34px;
      height: 34px;
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
    .header-icon {
      font-size: 2rem;
    }
    .modal-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .modal-subtitle {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-top: 0.2rem;
    }
    .error-banner {
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fb7185;
      padding: 0.65rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
    }
    .req {
      color: #fb7185;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }
    .flex-center-group {
      display: flex;
      align-items: center;
    }
    /* Skills input */
    .skills-input-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.4rem 0.6rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
      min-height: 44px;
    }
    .skills-input-box:focus-within {
      border-color: var(--accent-indigo);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
    }
    .tags-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .skill-tag {
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #c7d2fe;
      font-size: 0.775rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .del-tag-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 0;
    }
    .del-tag-btn:hover {
      color: #fb7185;
    }
    .tag-field {
      border: none;
      background: none;
      color: #fff;
      font-size: 0.85rem;
      outline: none;
      flex: 1;
      min-width: 140px;
      padding: 0.25rem 0.35rem;
    }
    .quick-skills-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.5rem;
    }
    .quick-title {
      font-size: 0.725rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .quick-skill-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 0.725rem;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .quick-skill-pill:hover {
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }
    .company-section-divider {
      margin: 1.5rem 0 1rem;
      padding-top: 1rem;
      border-top: 1px dashed var(--border-subtle);
    }
    .divider-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }
    @media (max-width: 640px) {
      .form-grid-2, .form-grid-3 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PostJobModalComponent implements OnInit {
  public readonly employerService = inject(EmployerService);
  public readonly jobService = inject(JobService);
  public readonly api = inject(ApiService);

  public readonly editJobId = input<string | null>(null);
  public readonly close = output<void>();

  public readonly submitting = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  // Form Fields
  public title = '';
  public categoryId = '';
  public jobType = 1; // Full-time
  public location = 'Addis Ababa, Ethiopia';
  public isRemote = false;
  public salaryMin?: number = 40000;
  public salaryMax?: number = 65000;
  public experienceLevel = 3; // Senior
  public salaryCurrency = 'ETB';
  public description = '';
  public requirements = '';
  public benefits = '';

  // Company Profile Info
  public companyIndustry = '';
  public companySize = '';
  public companyWebsite = '';
  public companyDescription = '';

  public skillInput = '';
  public readonly skills = signal<string[]>(['.NET 10', 'C#', 'Angular', 'PostgreSQL']);

  public popularSkills = ['PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'TypeScript', 'Redis', 'Kafka', 'SignalR', 'Microservices'];

  ngOnInit(): void {
    if (this.jobService.categories().length > 0 && !this.categoryId) {
      this.categoryId = this.jobService.categories()[0].id;
    }

    const editId = this.editJobId();
    if (editId) {
      this.jobService.loading.set(true);
      this.api.get<any>(`/api/v1/jobs/${editId}`).subscribe({
        next: (job) => {
          this.jobService.loading.set(false);
          if (job) {
            this.title = job.title || '';
            this.categoryId = job.category?.id || this.categoryId;
            this.jobType = job.jobType ?? 1;
            this.experienceLevel = job.experienceLevel ?? 3;
            this.location = job.location || 'Addis Ababa, Ethiopia';
            this.isRemote = !!job.isRemote;
            this.salaryMin = job.salaryMin;
            this.salaryMax = job.salaryMax;
            this.salaryCurrency = job.salaryCurrency || 'ETB';
            this.description = job.description || '';
            this.requirements = job.requirements || '';
            this.benefits = job.benefits || '';
            if (job.skills && Array.isArray(job.skills)) {
              this.skills.set(job.skills);
            }
            if (job.company) {
              this.companyIndustry = job.company.industry || '';
              this.companySize = job.company.companySize || '';
              this.companyWebsite = job.company.website || '';
              this.companyDescription = job.company.description || '';
            }
          }
        },
        error: () => {
          this.jobService.loading.set(false);
          this.errorMessage.set('Could not load requisition details for editing.');
        }
      });
    } else {
      const comp = this.employerService.companyProfile();
      if (comp) {
        this.companyIndustry = comp.industry || '';
        this.companySize = comp.companySize || '';
        this.companyWebsite = comp.website || '';
        this.companyDescription = comp.description || '';
      } else {
        this.employerService.loadCompanyProfile().subscribe({
          next: (c) => {
            if (c) {
              this.companyIndustry = c.industry || '';
              this.companySize = c.companySize || '';
              this.companyWebsite = c.website || '';
              this.companyDescription = c.description || '';
            }
          },
          error: () => {}
        });
      }
    }
  }

  hasSkill(skill: string): boolean {
    return this.skills().some((s) => s.toLowerCase() === skill.toLowerCase());
  }

  addSkill(skill: string): void {
    const trimmed = skill.trim();
    if (trimmed && !this.hasSkill(trimmed)) {
      this.skills.set([...this.skills(), trimmed]);
    }
  }

  removeSkill(skill: string): void {
    this.skills.set(this.skills().filter((s) => s !== skill));
  }

  onSkillKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (this.skillInput.trim()) {
        this.addSkill(this.skillInput);
        this.skillInput = '';
      }
    }
  }

  submitJob(): void {
    if (!this.title.trim()) {
      this.errorMessage.set('Please enter a job title.');
      return;
    }
    if (!this.categoryId) {
      this.errorMessage.set('Please select a job category.');
      return;
    }
    if (!this.description.trim()) {
      this.errorMessage.set('Please provide a job description.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const payload: CreateJobPayload = {
      title: this.title.trim(),
      categoryId: this.categoryId,
      jobType: Number(this.jobType),
      experienceLevel: Number(this.experienceLevel),
      location: this.location.trim(),
      isRemote: this.isRemote,
      salaryMin: this.salaryMin ? Number(this.salaryMin) : undefined,
      salaryMax: this.salaryMax ? Number(this.salaryMax) : undefined,
      salaryCurrency: this.salaryCurrency,
      description: this.description.trim(),
      requirements: this.requirements.trim() || undefined,
      benefits: this.benefits.trim() || undefined,
      skillNames: this.skills(),
      companyIndustry: this.companyIndustry.trim() || undefined,
      companySize: this.companySize || undefined,
      companyWebsite: this.companyWebsite.trim() || undefined,
      companyDescription: this.companyDescription.trim() || undefined
    };

    const editId = this.editJobId();
    const action$ = editId
      ? this.employerService.updateJob(editId, payload)
      : this.employerService.createJob(payload);

    action$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.error || (editId ? 'Failed to update job.' : 'Failed to publish job.'));
      }
    });
  }
}
