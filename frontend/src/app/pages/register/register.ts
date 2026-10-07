import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  email = '';
  password = '';
  confirmPassword = '';

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    this.authService.register({
      email: this.email,
      password: this.password,
    }).subscribe({

      next: (response) => {

        this.isSubmitting = false;

        this.successMessage = response.message;

        this.changeDetectorRef.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      error: (error) => {

        console.error('Registration error:', error);

        this.isSubmitting = false;

        if (error.error?.errors) {
          this.errorMessage = error.error.errors.join(' ');
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage =
            'Registration failed. Please try again.';
        }

        this.changeDetectorRef.detectChanges();
      },
    });
  }
}