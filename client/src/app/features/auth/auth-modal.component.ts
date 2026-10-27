import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-panel glass-panel-glow" (click)="$event.stopPropagation()">
        <!-- Close Button -->
        <button class="close-btn" (click)="close.emit()" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <!-- Tab Header -->
        <div class="tab-header">
          <button class="tab-btn" [class.active]="tab() === 'login'" (click)="tab.set('login')">
            Sign In
          </button>
          <button class="tab-btn" [class.active]="tab() === 'register'" (click)="tab.set('register')">
            Create Account
          </button>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">
            {{ errorMessage() }}
          </div>
        }

        @if (tab() === 'login') {
          <!-- Login Form -->
          <form class="auth-form" (ngSubmit)="handleLogin()">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" [(ngModel)]="email" name="email" required placeholder="employer@technova.com" />
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" [(ngModel)]="password" name="password" required placeholder="••••••••" />
            </div>

            <div class="demo-creds-container">
              <button type="button" class="quick-creds-btn seeker" (click)="fillSeekerDemo()">
                <span class="cred-role">Seeker:</span>
                <span>seeker&#64;example.com</span>
              </button>
              <button type="button" class="quick-creds-btn employer" (click)="fillEmployerDemo()">
                <span class="cred-role">Employer:</span>
                <span>employer&#64;technova.com</span>
              </button>
              <button type="button" class="quick-creds-btn admin" (click)="fillAdminDemo()">
                <span class="cred-role">Admin:</span>
                <span>admin&#64;jobportal.com</span>
              </button>
            </div>

            <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
              {{ loading() ? 'Signing in...' : 'Sign In to Account' }}
            </button>
          </form>
        } @else {
          <!-- Register Form -->
          <form class="auth-form" (ngSubmit)="handleRegister()">
            <div class="role-selector">
              <div 
                class="role-card" 
                [class.selected]="selectedRole === 1" 
                (click)="selectedRole = 1">
                <span class="role-title">Job Seeker</span>
                <span class="role-desc">Search, track & apply</span>
              </div>
              <div 
                class="role-card" 
                [class.selected]="selectedRole === 2" 
                (click)="selectedRole = 2">
                <span class="role-title">Employer</span>
                <span class="role-desc">Post jobs & hire</span>
              </div>
            </div>

            <div class="name-grid">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input type="text" class="form-input" [(ngModel)]="firstName" name="firstName" required placeholder="Alex" />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-input" [(ngModel)]="lastName" name="lastName" required placeholder="Rivera" />
              </div>
            </div>

            @if (selectedRole === 2) {
              <div class="form-group">
                <label class="form-label">Company Name</label>
                <input type="text" class="form-input" [(ngModel)]="companyName" name="companyName" required placeholder="Acme Technologies" />
              </div>
            }

            <div class="form-group">
              <label class="form-label">Work Email</label>
              <input type="email" class="form-input" [(ngModel)]="email" name="email" required placeholder="alex@example.com" />
            </div>

            <div class="form-group">
              <label class="form-label">Password (min 6 characters)</label>
              <input type="password" class="form-input" [(ngModel)]="password" name="password" required placeholder="••••••••" />
            </div>

            <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
              {{ loading() ? 'Creating account...' : 'Create CareerOrbit Account' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }
    .modal-panel {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 2.25rem;
      position: relative;
      box-shadow: var(--shadow-lg);
    }
    .close-btn {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .tab-header {
      display: flex;
      gap: 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
    }
    .tab-btn {
      background: none;
      border: none;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      position: relative;
      padding-bottom: 0.5rem;
      transition: color var(--transition-fast);
    }
    .tab-btn.active {
      color: var(--text-primary);
    }
    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -0.55rem;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--accent-primary);
    }
    .error-banner {
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fb7185;
      padding: 0.65rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    .role-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .role-card {
      padding: 0.85rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      text-align: center;
      transition: all var(--transition-fast);
    }
    .role-card.selected {
      border-color: var(--accent-primary);
      background: var(--accent-primary-subtle);
    }
    .role-title {
      display: block;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .role-desc {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }
    .name-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .form-group {
      margin-bottom: 1.15rem;
    }
    .form-label {
      display: block;
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
    }
    .demo-creds-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.4rem;
      margin-bottom: 1.25rem;
    }
    .quick-creds-btn {
      background: var(--bg-surface);
      border: 1px dashed var(--border-card);
      padding: 0.45rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.7rem;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.15rem;
      transition: all var(--transition-fast);
      text-align: left;
    }
    .quick-creds-btn:hover {
      background: var(--bg-card-hover);
      color: var(--text-secondary);
      border-color: var(--accent-primary);
    }
    .quick-creds-btn.seeker .cred-role {
      color: var(--accent-cyan);
      font-weight: 700;
    }
    .quick-creds-btn.employer .cred-role {
      color: var(--accent-primary);
      font-weight: 700;
    }
    .quick-creds-btn.admin .cred-role {
      color: var(--accent-rose);
      font-weight: 700;
    }
    .submit-btn {
      width: 100%;
      margin-top: 0.5rem;
    }
  `]
})
export class AuthModalComponent {
  private readonly auth = inject(AuthService);

  public readonly initialTab = input<'login' | 'register'>('login');
  public readonly close = output<void>();

  public readonly tab = signal<'login' | 'register'>('login');
  public readonly loading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  public email = '';
  public password = '';
  public firstName = '';
  public lastName = '';
  public companyName = '';
  public selectedRole = 1; // 1: Seeker, 2: Employer

  ngOnInit(): void {
    this.tab.set(this.initialTab());
  }

  fillSeekerDemo(): void {
    this.email = 'seeker@example.com';
    this.password = 'Seeker@123456';
  }

  fillEmployerDemo(): void {
    this.email = 'employer@technova.com';
    this.password = 'Employer@123456';
  }

  fillAdminDemo(): void {
    this.email = 'admin@jobportal.com';
    this.password = 'Admin@123456';
  }

  handleLogin(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.close.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.detail || err.error?.message || 'Invalid credentials.');
      }
    });
  }

  handleRegister(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const payload = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.selectedRole,
      companyName: this.selectedRole === 2 ? this.companyName : null
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.close.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.errors?.[0] || 'Registration failed.');
      }
    });
  }
}
