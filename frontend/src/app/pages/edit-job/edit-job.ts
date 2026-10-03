import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { JobService } from '../../services/job';

@Component({
  selector: 'app-edit-job',
  imports: [FormsModule],
  templateUrl: './edit-job.html',
  styleUrl: './edit-job.scss',
})
export class EditJob implements OnInit {

  job = {
    title: '',
    company: '',
    location: '',
    jobType: '',
    description: '',
    salary: 0,
  };

  jobId = 0;

  isLoading = true;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.jobId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadJob();
  }

  loadJob(): void {

    this.jobService.getJob(this.jobId).subscribe({
      next: (job) => {

        this.job = {
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          description: job.description,
          salary: job.salary,
        };

        this.isLoading = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {

        console.error('Error loading job:', error);

        this.isLoading = false;

        this.changeDetectorRef.detectChanges();
      },
    });
  }

  updateJob(): void {

    this.isSubmitting = true;

    this.jobService.updateJob(
      this.jobId,
      this.job
    ).subscribe({
      next: () => {

        this.isSubmitting = false;

        this.changeDetectorRef.detectChanges();

        this.router.navigate([
          '/jobs',
          this.jobId
        ]);
      },

      error: (error) => {

        console.error('Error updating job:', error);

        this.isSubmitting = false;

        this.changeDetectorRef.detectChanges();
      },
    });
  }
}