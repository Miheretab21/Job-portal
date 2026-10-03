import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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

  isDeleting = false;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

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

  editJob(): void {

    if (this.job) {

      this.router.navigate([
        '/edit-job',
        this.job.id
      ]);

    }
  }

  deleteJob(): void {

    if (!this.job) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${this.job.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    this.jobService.deleteJob(this.job.id).subscribe({
      next: () => {

        this.isDeleting = false;

        this.router.navigate(['/jobs']);
      },

      error: (error) => {

        console.error('Error deleting job:', error);

        this.isDeleting = false;

        this.changeDetectorRef.detectChanges();

        window.alert(
          'Something went wrong while deleting the job.'
        );
      },
    });
  }
}