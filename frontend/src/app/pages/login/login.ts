import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  email = '';
  password = '';

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  login(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.isSubmitting = true;

    this.authService.login({
      email: this.email,
      password: this.password,
    }).subscribe({

      next: (response) => {

        console.log('LOGIN SUCCESS:', response);

        this.isSubmitting = false;

        this.successMessage = response.message;

        console.log(
          'SUCCESS MESSAGE:',
          this.successMessage
        );

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {

        console.error('LOGIN ERROR:', error);

        this.isSubmitting = false;

        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage =
            'Login failed. Please try again.';
        }

        this.changeDetectorRef.detectChanges();
      },
    });
  }
}