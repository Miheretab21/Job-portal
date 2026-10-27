import { Component, inject, signal, effect, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent, NavTab } from './layout/navbar.component';
import { FooterComponent } from './layout/footer.component';
import { JobCardComponent } from './features/jobs/job-card.component';
import { JobDetailModalComponent } from './features/jobs/job-detail-modal.component';
import { AuthModalComponent } from './features/auth/auth-modal.component';
import { ApplicationsTrackerComponent } from './features/seeker/applications-tracker.component';
import { SavedJobsComponent } from './features/seeker/saved-jobs.component';
import { EmployerDashboardComponent } from './features/employer/employer-dashboard.component';
import { PostJobModalComponent } from './features/employer/post-job-modal.component';
import { CandidatePipelineComponent } from './features/employer/candidate-pipeline.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { NotificationToastComponent } from './layout/notification-toast.component';
import { JobService } from './core/services/job.service';
import { SeekerService } from './core/services/seeker.service';
import { EmployerService } from './core/services/employer.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { JobFilter } from './core/models/job.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    NotificationToastComponent,
    JobCardComponent,
    JobDetailModalComponent,
    AuthModalComponent,
    ApplicationsTrackerComponent,
    SavedJobsComponent,
    EmployerDashboardComponent,
    PostJobModalComponent,
    CandidatePipelineComponent,
    AdminDashboardComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  public readonly jobService = inject(JobService);
  public readonly seekerService = inject(SeekerService);
  public readonly employerService = inject(EmployerService);
  public readonly auth = inject(AuthService);
  public readonly theme = inject(ThemeService);

  // Active View Tab: 'explore' | 'applications' | 'saved' | 'employer-dashboard' | 'candidate-pipeline' | 'admin'
  public readonly activeTab = signal<NavTab>('explore');

  // FAQ Accordion State
  public readonly openFaqIndex = signal<number | null>(null);
  public readonly pageSize = signal<number>(10);

  // Search & Filter State
  public searchQuery = '';
  public locationQuery = '';
  public customSkillInput = '';
  public selectedCategorySlug = signal<string | null>(null);
  public selectedSkills = signal<string[]>([]);
  public selectedExperienceLevels = signal<number[]>([]);
  public selectedJobTypes = signal<number[]>([]);
  public selectedEducationLevel = signal<string | null>(null);
  public selectedCity = signal<string | null>(null);
  public isNegotiableOnly = signal<boolean>(false);
  public minSalary = signal<number | null>(null);
  public maxSalary = signal<number | null>(null);
  public selectedCurrency = signal<'ALL' | 'ETB' | 'USD'>('ALL');
  public isRemoteOnly = signal<boolean>(false);
  public isMobileFilterOpen = signal<boolean>(false);
  public sortBy = signal<string>('recent');

  private searchDebounceTimer?: any;

  // Active Filters Metric
  public readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.locationQuery.trim()) count++;
    if (this.selectedCategorySlug()) count++;
    if (this.isRemoteOnly()) count++;
    if (this.selectedCurrency() !== 'ALL') count++;
    if (this.minSalary() !== null || this.maxSalary() !== null) count++;
    if (this.selectedEducationLevel()) count++;
    if (this.selectedCity()) count++;
    if (this.isNegotiableOnly()) count++;
    count += this.selectedSkills().length;
    count += this.selectedExperienceLevels().length;
    count += this.selectedJobTypes().length;
    return count;
  });

  public readonly hasActiveFilters = computed(() => this.activeFilterCount() > 0);

  // Modals State
  public authModalTab = signal<'login' | 'register' | null>(null);
  public isPostJobModalOpen = signal<boolean>(false);
  public editingJobId = signal<string | null>(null);

  private lastHandledUserId: string | null = '__init__';

  constructor() {
    // React to auth session changes (only on user ID change to prevent trapping employer navigation)
    effect(() => {
      const user = this.auth.currentUser();
      const currentUserId = user?.id ?? null;

      if (currentUserId !== this.lastHandledUserId) {
        this.lastHandledUserId = currentUserId;

        if (user) {
          if (this.auth.isAdmin()) {
            this.activeTab.set('admin');
          } else if (this.auth.isEmployer()) {
            this.employerService.loadSummary().subscribe();
            this.employerService.loadJobs().subscribe();
            this.employerService.loadApplicants().subscribe();
            this.employerService.loadCompanyProfile().subscribe();
            this.activeTab.set('employer-dashboard');
          } else {
            this.seekerService.loadApplications().subscribe();
            this.seekerService.loadSavedJobs().subscribe();
            this.seekerService.loadSavedJobIds().subscribe();
            this.activeTab.set('explore');
          }
        } else {
          this.seekerService.applications.set([]);
          this.seekerService.savedJobs.set([]);
          this.seekerService.savedJobIds.set(new Set());
          this.employerService.jobs.set([]);
          this.employerService.applicants.set([]);
          this.employerService.companyProfile.set(null);
          this.activeTab.set('explore');
        }
      }
    });
  }

  ngOnInit(): void {
    this.jobService.loadCategories();
    this.jobService.loadFacets();
    this.applyFilters();
    this.checkJobRoute();

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.checkJobRoute();
      });
    }
  }

  private checkJobRoute(): void {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    const match = path.match(/\/jobs\/([a-zA-Z0-9-]+)/);
    if (match && match[1]) {
      this.jobService.selectJob(match[1]);
    } else if (path === '/' && this.jobService.selectedJob()) {
      this.jobService.clearSelectedJob();
    }
  }

  switchTab(tab: NavTab): void {
    if ((tab === 'applications' || tab === 'saved' || tab === 'employer-dashboard' || tab === 'candidate-pipeline' || tab === 'admin') && !this.auth.isAuthenticated()) {
      this.openAuthModal('login');
      return;
    }

    // If modal is open or URL is on a job route, close modal and reset URL
    if (this.jobService.selectedJob()) {
      this.jobService.clearSelectedJob();
    }
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/jobs/')) {
      window.history.pushState({}, '', '/');
    }

    this.activeTab.set(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewPipelineForJob(jobId: string | null): void {
    this.employerService.loadApplicants(jobId ?? undefined).subscribe();
    this.activeTab.set('candidate-pipeline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Debounced input handler for real-time keystroke searching
  onSearchInput(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.applyFilters();
    }, 320);
  }

  applyFilters(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = undefined;
    }

    const filter: JobFilter = {
      search: this.searchQuery.trim() || undefined,
      location: this.locationQuery.trim() || undefined,
      categorySlug: this.selectedCategorySlug() || undefined,
      skills: this.selectedSkills().length > 0 ? this.selectedSkills() : undefined,
      experienceLevels: this.selectedExperienceLevels().length > 0 ? this.selectedExperienceLevels() : undefined,
      jobTypes: this.selectedJobTypes().length > 0 ? this.selectedJobTypes() : undefined,
      isRemote: this.isRemoteOnly() ? true : undefined,
      educationLevel: this.selectedEducationLevel() ?? undefined,
      city: this.selectedCity() ?? undefined,
      isNegotiable: this.isNegotiableOnly() ? true : undefined,
      minSalary: this.minSalary() ?? undefined,
      maxSalary: this.maxSalary() ?? undefined,
      salaryCurrency: this.selectedCurrency() !== 'ALL' ? this.selectedCurrency() : undefined,
      sortBy: this.sortBy(),
      pageNumber: 1,
      pageSize: this.pageSize()
    };

    this.jobService.loadJobs(filter);
  }

  selectCategory(slug: string | null): void {
    this.selectedCategorySlug.set(this.selectedCategorySlug() === slug ? null : slug);
    this.applyFilters();
  }

  toggleRemote(): void {
    this.isRemoteOnly.set(!this.isRemoteOnly());
    this.applyFilters();
  }

  toggleSkill(skill: string): void {
    const current = this.selectedSkills();
    if (current.includes(skill)) {
      this.selectedSkills.set(current.filter(s => s !== skill));
    } else {
      this.selectedSkills.set([...current, skill]);
    }
    this.applyFilters();
  }

  removeSkill(skill: string): void {
    this.selectedSkills.set(this.selectedSkills().filter(s => s !== skill));
    this.applyFilters();
  }

  addCustomSkill(): void {
    const val = this.customSkillInput.trim();
    if (val && !this.selectedSkills().includes(val)) {
      this.selectedSkills.set([...this.selectedSkills(), val]);
      this.customSkillInput = '';
      this.applyFilters();
    }
  }

  toggleExperienceLevel(level: number): void {
    const current = this.selectedExperienceLevels();
    if (current.includes(level)) {
      this.selectedExperienceLevels.set(current.filter(l => l !== level));
    } else {
      this.selectedExperienceLevels.set([...current, level]);
    }
    this.applyFilters();
  }

  removeExperienceLevel(level: number): void {
    this.selectedExperienceLevels.set(this.selectedExperienceLevels().filter(l => l !== level));
    this.applyFilters();
  }

  toggleJobType(type: number): void {
    const current = this.selectedJobTypes();
    if (current.includes(type)) {
      this.selectedJobTypes.set(current.filter(t => t !== type));
    } else {
      this.selectedJobTypes.set([...current, type]);
    }
    this.applyFilters();
  }

  removeJobType(type: number): void {
    this.selectedJobTypes.set(this.selectedJobTypes().filter(t => t !== type));
    this.applyFilters();
  }

  setCurrency(curr: 'ALL' | 'ETB' | 'USD'): void {
    this.selectedCurrency.set(curr);
    this.minSalary.set(null);
    this.maxSalary.set(null);
    this.applyFilters();
  }

  setSalaryPreset(min: number | null, max: number | null): void {
    this.minSalary.set(min);
    this.maxSalary.set(max);
    this.applyFilters();
  }

  onSalaryChange(): void {
    this.applyFilters();
  }

  clearSalary(): void {
    this.minSalary.set(null);
    this.maxSalary.set(null);
    this.selectedCurrency.set('ALL');
    this.applyFilters();
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy.set(select.value);
    this.applyFilters();
  }

  setEducationLevel(level: string | null): void {
    this.selectedEducationLevel.set(this.selectedEducationLevel() === level ? null : level);
    this.applyFilters();
  }

  setCity(city: string | null): void {
    this.selectedCity.set(this.selectedCity() === city ? null : city);
    this.applyFilters();
  }

  toggleNegotiableOnly(): void {
    this.isNegotiableOnly.set(!this.isNegotiableOnly());
    this.applyFilters();
  }

  resetFilters(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = undefined;
    }
    this.searchQuery = '';
    this.locationQuery = '';
    this.customSkillInput = '';
    this.selectedCategorySlug.set(null);
    this.selectedSkills.set([]);
    this.selectedExperienceLevels.set([]);
    this.selectedJobTypes.set([]);
    this.selectedEducationLevel.set(null);
    this.selectedCity.set(null);
    this.isNegotiableOnly.set(false);
    this.minSalary.set(null);
    this.maxSalary.set(null);
    this.selectedCurrency.set('ALL');
    this.isRemoteOnly.set(false);
    this.sortBy.set('recent');
    this.applyFilters();
  }

  openMobileFilter(): void {
    this.isMobileFilterOpen.set(true);
  }

  closeMobileFilter(): void {
    this.isMobileFilterOpen.set(false);
  }

  applyMobileFilter(): void {
    this.applyFilters();
    this.isMobileFilterOpen.set(false);
  }

  getCategoryIcon(slug: string): string {
    const icons: Record<string, string> = {
      'technology': '💻',
      'software-engineering': '💻',
      'banking-finance': '🏦',
      'healthcare': '🩺',
      'ngo-development': '🌍',
      'education': '🎓',
      'sales-marketing': '📈',
      'engineering-construction': '🏗️',
      'agriculture-agribusiness': '🌾',
      'hospitality-tourism': '🏨',
      'logistics-supply-chain': '📦',
      'admin-hr-legal': '⚖️'
    };
    return icons[slug] || '💼';
  }

  getExperienceLevelLabel(level: number): string {
    const map: Record<number, string> = {
      1: 'Entry Level',
      2: 'Mid Level',
      3: 'Senior Level',
      4: 'Lead / Staff',
      5: 'Executive'
    };
    return map[level] || `Level ${level}`;
  }

  getJobTypeLabel(type: number): string {
    const map: Record<number, string> = {
      1: 'Full-time',
      2: 'Part-time',
      3: 'Contract',
      4: 'Remote',
      5: 'Internship'
    };
    return map[type] || `Type ${type}`;
  }

  openAuthModal(tab: 'login' | 'register'): void {
    this.authModalTab.set(tab);
  }

  closeAuthModal(): void {
    this.authModalTab.set(null);
  }

  openPostJobModal(): void {
    this.editingJobId.set(null);
    this.isPostJobModalOpen.set(true);
  }

  openEditJobModal(jobId: string): void {
    this.editingJobId.set(jobId);
    this.isPostJobModalOpen.set(true);
  }

  closePostJobModal(): void {
    this.editingJobId.set(null);
    this.isPostJobModalOpen.set(false);
  }

  toggleFaq(index: number): void {
    this.openFaqIndex.set(this.openFaqIndex() === index ? null : index);
  }

  loadMoreJobs(): void {
    this.pageSize.update(s => s + 10);
    this.applyFilters();
  }
}
