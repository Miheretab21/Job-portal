import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { JobService } from '../../services/job';

@Component({
  selector: 'app-create-job',
  imports: [FormsModule],
  templateUrl: './create-job.html',
  styleUrl: './create-job.scss',
})
export class CreateJob {

  job = {
    title: '',
    company: '',
    location: '',
    jobType: '',
    description: '',
    salary: 0,
  };

  isSubmitting = false;

  constructor(
    private jobService: JobService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  createJob(): void {

    this.isSubmitting = true;

    this.jobService.createJob(this.job).subscribe({
      next: () => {

        this.isSubmitting = false;

        this.changeDetectorRef.detectChanges();

        this.router.navigate(['/jobs']);
      },

      error: (error) => {

        console.error('Error creating job:', error);

        this.isSubmitting = false;

        this.changeDetectorRef.detectChanges();
      },
    });
  }
}