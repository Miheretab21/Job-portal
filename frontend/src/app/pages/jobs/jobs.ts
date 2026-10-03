import { Component, OnInit } from '@angular/core';

import { Job } from '../../models/job';
import { JobService } from '../../services/job';

@Component({
  selector: 'app-jobs',
  imports: [],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {

  jobs: Job[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    console.log('Jobs page loaded');

    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        console.log('Jobs received from API:', jobs);

        this.jobs = jobs;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
      },
    });
  }
}