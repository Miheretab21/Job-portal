import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Job } from '../../models/job';
import { JobService } from '../../services/job';

@Component({
  selector: 'app-jobs',
  imports: [RouterLink],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {

  jobs: Job[] = [];

  constructor(
    private jobService: JobService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;

        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
      },
    });
  }
}