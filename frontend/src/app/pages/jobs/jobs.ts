import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Job } from '../../models/job';
import { JobService } from '../../services/job';

@Component({
  selector: 'app-jobs',
  imports: [FormsModule, RouterLink],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {

  jobs: Job[] = [];

  filteredJobs: Job[] = [];

  searchTerm = '';

  selectedJobType = 'All';

  constructor(
    private jobService: JobService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.filteredJobs = jobs;

        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
      },
    });
  }

  filterJobs(): void {
    const search = this.searchTerm.toLowerCase().trim();

    this.filteredJobs = this.jobs.filter((job) => {

      const matchesSearch =
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.location.toLowerCase().includes(search);

      const matchesJobType =
        this.selectedJobType === 'All' ||
        job.jobType === this.selectedJobType;

      return matchesSearch && matchesJobType;
    });
  }

  onSearchChange(): void {
    this.filterJobs();
  }

  onJobTypeChange(): void {
    this.filterJobs();
  }
}