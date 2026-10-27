import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notificationService.latestToast(); as toast) {
      <div class="toast-wrapper animate-slide-in">
        <aside class="toast-card glass-panel-glow" [ngClass]="getToastTypeClass(toast.type)" (click)="onToastClick(toast.id)" aria-live="polite">
          <div class="toast-indicator"></div>

          <div class="toast-icon-box">
            @if (toast.type === 'ApplicationStageUpdated') {
              <span>⭐</span>
            } @else if (toast.type === 'NewApplicationReceived') {
              <span>📥</span>
            } @else {
              <span>⚡</span>
            }
          </div>

          <div class="toast-content">
            <div class="toast-head">
              <span class="toast-title">{{ toast.title }}</span>
              <span class="toast-time">Just now</span>
            </div>
            <p class="toast-message">{{ toast.message }}</p>
          </div>

          <button class="toast-close-btn" (click)="$event.stopPropagation(); notificationService.dismissToast()" aria-label="Close notification">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </aside>
      </div>
    }
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      top: 5rem;
      right: 1.5rem;
      z-index: 9999;
      max-width: 420px;
      width: calc(100% - 3rem);
      pointer-events: none;
    }
    .toast-card {
      pointer-events: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 1rem 1.15rem;
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .toast-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg), 0 0 20px var(--border-hover);
    }
    .toast-indicator {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, var(--accent-cyan), var(--accent-indigo));
    }
    .toast-icon-box {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .toast-content {
      flex: 1;
      min-width: 0;
    }
    .toast-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.2rem;
    }
    .toast-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .toast-time {
      font-size: 0.7rem;
      color: var(--accent-cyan);
      font-family: var(--font-mono);
      font-weight: 600;
    }
    .toast-message {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin: 0;
    }
    .toast-close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
      flex-shrink: 0;
    }
    .toast-close-btn:hover {
      color: #fff;
    }
    .toast-stage-updated {
      border-color: rgba(45, 212, 191, 0.5);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(45, 212, 191, 0.25);
    }
    .toast-new-application {
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.25);
    }
    @keyframes slideInRight {
      from {
        transform: translateX(110%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class NotificationToastComponent {
  public readonly notificationService = inject(NotificationService);

  getToastTypeClass(type: string): string {
    if (type === 'ApplicationStageUpdated') return 'toast-stage-updated';
    if (type === 'NewApplicationReceived') return 'toast-new-application';
    return '';
  }

  onToastClick(id: string): void {
    this.notificationService.markAsRead(id);
    this.notificationService.dismissToast();
  }
}
