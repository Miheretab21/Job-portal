import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Job } from '../../models/job';
import { JobService } from '../../services/job';

@Component({
  selector: 'app-job-details',
  imports: [DatePipe],
  templateUrl: './job-details.html',
  styleUrl: './job-details.scss',
})
export class JobDetails implements OnInit {

  job: Job | null = null;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.jobService.getJob(id).subscribe({
      next: (job) => {
        this.job = job;

        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading job:', error);
      },
    });
  }
}