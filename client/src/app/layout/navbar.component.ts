import { Component, HostListener, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { SeekerService } from '../core/services/seeker.service';
import { EmployerService } from '../core/services/employer.service';
import { NotificationService } from '../core/services/notification.service';
import { ThemeService } from '../core/services/theme.service';

export type NavTab = 'explore' | 'applications' | 'saved' | 'employer-dashboard' | 'candidate-pipeline' | 'admin';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar-wrapper">
      <div class="nav-container">
        <!-- Brand Logo -->
        <div class="brand" (click)="onBrandClick()" role="button" tabindex="0" (keyup.enter)="onBrandClick()">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="m10 15 5-3-5-3v6Z"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">Career<span class="text-gradient">Orbit</span></span>
          </div>
        </div>

        <!-- Center Nav -->
        <nav class="nav-links" aria-label="Main Navigation">
          @if (auth.isAdmin()) {
            <!-- Admin Navigation -->
            <button 
              type="button" 
              class="nav-tab-btn admin-tab-btn" 
              [class.active]="activeTab() === 'admin'" 
              (click)="activeTabChange.emit('admin')">
              <span class="admin-tab-icon">🛡️</span>
              <span>Admin Console</span>
            </button>

            <button 
              type="button" 
              class="nav-tab-btn" 
              [class.active]="activeTab() === 'explore'" 
              (click)="activeTabChange.emit('explore')">
              Explore Jobs
            </button>
          } @else if (auth.isEmployer()) {
            <!-- Employer Navigation -->
            <button 
              type="button" 
              class="nav-tab-btn" 
              [class.active]="activeTab() === 'employer-dashboard'" 
              (click)="activeTabChange.emit('employer-dashboard')">
              <span>Hiring Dashboard</span>
            </button>

            <button 
              type="button" 
              class="nav-tab-btn" 
              [class.active]="activeTab() === 'candidate-pipeline'" 
              (click)="activeTabChange.emit('candidate-pipeline')">
              <span>Candidate Pipeline</span>
              @if (employerService.applicants().length > 0) {
                <span class="nav-counter">{{ employerService.applicants().length }}</span>
              }
            </button>

            <button 
              type="button" 
              class="nav-tab-btn" 
              [class.active]="activeTab() === 'explore'" 
              (click)="activeTabChange.emit('explore')">
              Explore Jobs
            </button>
          } @else {
            <!-- Candidate / Guest Navigation -->
            <button 
              type="button" 
              class="nav-tab-btn" 
              [class.active]="activeTab() === 'explore'" 
              (click)="activeTabChange.emit('explore')">
              Explore Jobs
            </button>

            @if (auth.isAuthenticated()) {
              <button 
                type="button" 
                class="nav-tab-btn" 
                [class.active]="activeTab() === 'applications'" 
                (click)="activeTabChange.emit('applications')">
                <span>My Applications</span>
                @if (seekerService.applications().length > 0) {
                  <span class="nav-counter">{{ seekerService.applications().length }}</span>
                }
              </button>

              <button 
                type="button" 
                class="nav-tab-btn" 
                [class.active]="activeTab() === 'saved'" 
                (click)="activeTabChange.emit('saved')">
                <span>Saved Roles</span>
                @if (seekerService.savedJobs().length > 0) {
                  <span class="nav-counter">{{ seekerService.savedJobs().length }}</span>
                }
              </button>
            }

            @if (!auth.isAuthenticated()) {
              <a href="#companies" class="nav-link" (click)="scrollTo('companies', $event)">
                <span>Featured Teams</span>
              </a>

              <a href="#how-it-works" class="nav-link" (click)="scrollTo('how-it-works', $event)">
                <span>How It Works</span>
              </a>

              <a href="#for-employers" class="nav-link" (click)="onForEmployersClick($event)">
                <span>For Employers</span>
              </a>
            }
          }
        </nav>

        <!-- Right Actions -->
        <div class="nav-actions">
          <!-- Live Day / Night Theme Toggle -->
          <button 
            type="button" 
            class="theme-toggle-btn" 
            (click)="themeService.toggleTheme()" 
            [title]="themeService.isDark() ? 'Switch to Day Mode (Cool Ice & Crimson)' : 'Switch to Dark Mode (Obsidian & Electric Lime)'"
            aria-label="Toggle Light and Dark Theme">
            @if (themeService.isDark()) {
              <!-- Sun icon for dark mode -->
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            } @else {
              <!-- Moon icon for light mode -->
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            }
          </button>

          @if (auth.isAuthenticated()) {
            @if (auth.isEmployer()) {
              <button class="btn btn-sm btn-primary post-btn desktop-auth-btn" (click)="openPostJob.emit()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Post Job
              </button>
            }

            <!-- Notification Bell & Dropdown -->
            <div class="notif-wrapper">
              <button 
                type="button"
                class="notif-bell-btn" 
                [class.has-unread]="notificationService.unreadCount() > 0"
                (click)="toggleNotifications($event)"
                aria-label="Notifications">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                @if (notificationService.unreadCount() > 0) {
                  <span class="notif-badge">{{ notificationService.unreadCount() }}</span>
                }
              </button>

              @if (isNotificationDropdownOpen()) {
                <div class="notif-dropdown glass-panel-glow" (click)="$event.stopPropagation()">
                  <div class="notif-drop-header">
                    <div class="drop-title-row">
                      <span class="drop-title">Live Updates</span>
                      @if (notificationService.isConnected()) {
                        <span class="signalr-live-tag">● SignalR Live</span>
                      }
                    </div>
                    @if (notificationService.unreadCount() > 0) {
                      <button class="mark-read-btn" (click)="notificationService.markAllAsRead()">Mark all read</button>
                    }
                  </div>

                  <div class="notif-items-list">
                    @for (item of notificationService.notifications(); track item.id) {
                      <div class="notif-item" [class.unread]="!item.isRead" (click)="notificationService.markAsRead(item.id)">
                        <div class="notif-item-header">
                          <span class="notif-item-title">{{ item.title }}</span>
                          <span class="notif-item-time">{{ formatTime(item.createdAtUtc) }}</span>
                        </div>
                        <p class="notif-item-msg">{{ item.message }}</p>
                      </div>
                    } @empty {
                      <div class="notif-empty">
                        <span>No new notifications</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- User Profile Avatar & Dropdown -->
            <div class="user-menu-wrapper desktop-user-menu">
              <button 
                type="button" 
                class="user-menu-btn" 
                [class.active]="isUserDropdownOpen()"
                (click)="toggleUserDropdown($event)"
                aria-label="User Account Menu"
                [attr.aria-expanded]="isUserDropdownOpen()">
                <div class="user-avatar" [class.employer-avatar]="auth.isEmployer()" [class.admin-avatar]="auth.isAdmin()">
                  {{ auth.currentUser()?.firstName?.charAt(0) }}
                </div>
                <span class="user-short-name">{{ auth.currentUser()?.firstName || auth.currentUser()?.fullName }}</span>
                <svg class="chevron-icon" [class.rotated]="isUserDropdownOpen()" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              @if (isUserDropdownOpen()) {
                <div class="user-dropdown glass-panel-glow" (click)="$event.stopPropagation()">
                  <div class="user-drop-header">
                    <div class="drop-user-info">
                      <div class="user-avatar large-avatar" [class.employer-avatar]="auth.isEmployer()" [class.admin-avatar]="auth.isAdmin()">
                        {{ auth.currentUser()?.firstName?.charAt(0) }}
                      </div>
                      <div class="drop-user-text">
                        <span class="drop-user-name" [title]="auth.currentUser()?.fullName">{{ auth.currentUser()?.fullName }}</span>
                        <span class="drop-user-email" [title]="auth.currentUser()?.email">{{ auth.currentUser()?.email }}</span>
                        <span class="role-tag" [class.employer-tag]="auth.isEmployer()" [class.admin-tag]="auth.isAdmin()">
                          {{ auth.isAdmin() ? 'Administrator' : (auth.isEmployer() ? 'Employer' : 'Job Seeker') }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="user-drop-actions">
                    @if (auth.isAdmin()) {
                      <button type="button" class="drop-action-item" (click)="activeTabChange.emit('admin'); isUserDropdownOpen.set(false)">
                        <span>🛡️ Admin Console</span>
                      </button>
                    } @else if (auth.isEmployer()) {
                      <button type="button" class="drop-action-item" (click)="activeTabChange.emit('employer-dashboard'); isUserDropdownOpen.set(false)">
                        <span>📊 Hiring Dashboard</span>
                      </button>
                      <button type="button" class="drop-action-item" (click)="activeTabChange.emit('candidate-pipeline'); isUserDropdownOpen.set(false)">
                        <span>👥 Candidate Pipeline</span>
                      </button>
                    } @else {
                      <button type="button" class="drop-action-item" (click)="activeTabChange.emit('applications'); isUserDropdownOpen.set(false)">
                        <span>📋 My Applications</span>
                        @if (seekerService.applications().length > 0) {
                          <span class="drop-counter">{{ seekerService.applications().length }}</span>
                        }
                      </button>
                      <button type="button" class="drop-action-item" (click)="activeTabChange.emit('saved'); isUserDropdownOpen.set(false)">
                        <span>🔖 Saved Roles</span>
                        @if (seekerService.savedJobs().length > 0) {
                          <span class="drop-counter">{{ seekerService.savedJobs().length }}</span>
                        }
                      </button>
                    }
                  </div>

                  <div class="user-drop-footer">
                    <button type="button" class="sign-out-btn" (click)="auth.logout(); isUserDropdownOpen.set(false)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <button class="btn btn-sm btn-secondary desktop-auth-btn" (click)="openAuth.emit('login')">Sign In</button>
            <button class="btn btn-sm btn-primary desktop-auth-btn" (click)="openAuth.emit('register')">Create Profile</button>
          }

          <!-- Mobile Hamburger Toggle Button -->
          <button 
            type="button" 
            class="hamburger-btn" 
            (click)="toggleMobileMenu()" 
            [attr.aria-expanded]="isMobileMenuOpen()" 
            aria-label="Toggle navigation menu">
            @if (isMobileMenuOpen()) {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            } @else {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      @if (isMobileMenuOpen()) {
        <div class="mobile-drawer-overlay" (click)="isMobileMenuOpen.set(false)"></div>
        <div class="mobile-drawer glass-panel-glow animate-fade-in" (click)="$event.stopPropagation()">
          <div class="mobile-drawer-links">
            @if (auth.isAdmin()) {
              <button type="button" class="mobile-drawer-btn" [class.active]="activeTab() === 'admin'" (click)="onMobileTabSelect('admin')">
                <span>🛡️ Admin Console</span>
              </button>
              <button type="button" class="mobile-drawer-btn" [class.active]="activeTab() === 'explore'" (click)="onMobileTabSelect('explore')">
                <span>Explore Jobs</span>
              </button>
            } @else if (auth.isEmployer()) {
              <button type="button" class="mobile-drawer-btn" [class.active]="activeTab() === 'employer-dashboard'" (click)="onMobileTabSelect('employer-dashboard')">
                <span>💼 Hiring Dashboard</span>
              </button>
              <button type="button" class="mobile-drawer-btn" [class.active]="activeTab() === 'candidate-pipeline'" (click)="onMobileTabSelect('candidate-pipeline')">
                <span>👥 Candidate Pipeline</span>
                @if (employerService.applicants().length > 0) {
                  <span class="nav-counter">{{ employerService.applicants().length }}</span>
                }
              </button>
              <button type="button" class="mobile-drawer-btn" [class.active]="activeTab() === 'explore'" (click)="onMobileTabSelect('explore')">
                <span>Explore Jobs</span>
              </button>
              <button type="button" class="mobile-drawer-btn btn-post-mobile" (click)="openPostJob.emit(); isMobileMenuOpen.set(false)">
                <span>+ Post a New Job</span>
              </button>
            } @else {
              <button type="button" class="mobile-drawer-btn" [class.active]="activeTab() === 'explore'" (click)="onMobileTabSelect('explore')">
                <span>Explore Jobs</span>
              </button>
              @if (auth.isAuthenticated()) {
                <button type="button" class="mobile-drawer-btn" [class.active]="activeTab() === 'applications'" (click)="onMobileTabSelect('applications')">
                  <span>My Applications</span>
                  @if (seekerService.applications().length > 0) {
                    <span class="nav-counter">{{ seekerService.applications().length }}</span>
                  }
                </button>
                <button type="button" class="mobile-drawer-btn" [class.active]="activeTab() === 'saved'" (click)="onMobileTabSelect('saved')">
                  <span>Saved Roles</span>
                  @if (seekerService.savedJobs().length > 0) {
                    <span class="nav-counter">{{ seekerService.savedJobs().length }}</span>
                  }
                </button>
              }
              <a href="#companies" class="mobile-drawer-link" (click)="onMobileScrollTo('companies', $event)">
                <span>Featured Teams</span>
              </a>
              <a href="#how-it-works" class="mobile-drawer-link" (click)="onMobileScrollTo('how-it-works', $event)">
                <span>How It Works</span>
              </a>
              <a href="#for-employers" class="mobile-drawer-link" (click)="onMobileForEmployers($event)">
                <span>For Employers</span>
              </a>
            }
          </div>

          <div class="mobile-drawer-footer">
            @if (auth.isAuthenticated()) {
              <div class="mobile-user-row">
                <div class="user-avatar" [class.employer-avatar]="auth.isEmployer()" [class.admin-avatar]="auth.isAdmin()">
                  {{ auth.currentUser()?.firstName?.charAt(0) }}
                </div>
                <div class="user-meta">
                  <span class="user-name">{{ auth.currentUser()?.fullName }}</span>
                  <span class="user-role">{{ auth.isAdmin() ? 'Administrator' : (auth.isEmployer() ? 'Employer' : 'Job Seeker') }}</span>
                </div>
              </div>
              <button type="button" class="btn btn-outline w-full" (click)="auth.logout(); isMobileMenuOpen.set(false)">Sign Out</button>
            } @else {
              <div class="mobile-guest-actions">
                <button type="button" class="btn btn-secondary w-full" (click)="openAuth.emit('login'); isMobileMenuOpen.set(false)">Sign In</button>
                <button type="button" class="btn btn-primary w-full" (click)="openAuth.emit('register'); isMobileMenuOpen.set(false)">Create Profile</button>
              </div>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .navbar-wrapper {
      width: 100%;
      background: var(--bg-glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      transition: background-color var(--transition-normal), border-color var(--transition-normal);
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--brand-icon-bg);
      color: var(--brand-icon-color);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px var(--accent-primary-glow);
      transition: background-color var(--transition-normal), color var(--transition-normal);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .brand-badge {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      white-space: nowrap;
    }
    .nav-tab-btn {
      background: none;
      border: 1px solid transparent;
      font-size: 0.925rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.75rem;
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .nav-tab-btn:hover {
      color: var(--text-primary);
      background: var(--bg-surface);
      border-color: var(--border-subtle);
    }
    .nav-tab-btn.active {
      color: var(--text-primary);
      font-weight: 600;
      background: var(--bg-card);
      border-color: var(--border-card);
      box-shadow: var(--shadow-sm);
    }
    .nav-counter {
      background: var(--accent-primary);
      color: var(--accent-primary-text);
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.1rem 0.45rem;
      border-radius: var(--radius-full);
      font-family: var(--font-mono);
    }
    .nav-link {
      font-size: 0.925rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: color var(--transition-fast);
      display: flex;
      align-items: center;
      gap: 0.35rem;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .nav-link:hover {
      color: var(--text-primary);
    }
    .api-link {
      color: var(--text-secondary);
    }
    .link-tag {
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--text-muted);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .theme-toggle-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .theme-toggle-btn:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      background: var(--accent-primary-subtle);
      transform: rotate(15deg);
    }
    .post-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    /* Notifications */
    .notif-wrapper {
      position: relative;
    }
    .notif-bell-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
    }
    .notif-bell-btn:hover {
      background: var(--bg-card-hover);
      color: var(--text-primary);
      border-color: var(--border-hover);
    }
    .notif-bell-btn.has-unread {
      color: var(--accent-primary);
    }
    .notif-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--accent-primary);
      color: var(--accent-primary-text);
      font-size: 0.65rem;
      font-weight: 800;
      min-width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px var(--accent-primary-glow);
    }
    .notif-dropdown {
      position: absolute;
      top: calc(100% + 0.75rem);
      right: 0;
      width: 320px;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      animation: fadeIn 0.2s ease;
    }
    .notif-drop-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface);
    }
    .drop-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .drop-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .signalr-live-tag {
      font-size: 0.65rem;
      color: var(--accent-emerald);
      font-family: var(--font-mono);
      font-weight: 700;
    }
    .mark-read-btn {
      background: none;
      border: none;
      color: var(--accent-primary);
      font-size: 0.725rem;
      font-weight: 600;
      cursor: pointer;
    }
    .notif-items-list {
      max-height: 280px;
      overflow-y: auto;
    }
    .notif-item {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .notif-item:hover {
      background: var(--bg-card-hover);
    }
    .notif-item.unread {
      background: var(--accent-primary-subtle);
      border-left: 3px solid var(--accent-primary);
    }
    .notif-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }
    .notif-item-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .notif-item-time {
      font-size: 0.675rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    .notif-item-msg {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0.25rem 0 0;
      line-height: 1.4;
    }
    .notif-empty {
      padding: 2rem 1rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    /* User Menu & Dropdown */
    .user-menu-wrapper {
      position: relative;
    }
    .user-menu-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      padding: 0.3rem 0.65rem 0.3rem 0.35rem;
      border-radius: var(--radius-full);
      cursor: pointer;
      color: var(--text-primary);
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .user-menu-btn:hover, .user-menu-btn.active {
      border-color: var(--accent-primary);
      background: var(--bg-card-hover);
      box-shadow: var(--shadow-sm);
    }
    .user-short-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      max-width: 110px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chevron-icon {
      color: var(--text-muted);
      transition: transform var(--transition-fast);
    }
    .chevron-icon.rotated {
      transform: rotate(180deg);
    }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 0.65rem);
      right: 0;
      width: 270px;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      animation: fadeIn 0.18s ease;
      z-index: 100;
    }
    .user-drop-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface);
    }
    .drop-user-info {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .large-avatar {
      width: 40px !important;
      height: 40px !important;
      font-size: 1.05rem !important;
      flex-shrink: 0;
    }
    .drop-user-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .drop-user-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .drop-user-email {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.35rem;
    }
    .role-tag {
      align-self: flex-start;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      background: rgba(14, 165, 233, 0.12);
      color: var(--accent-cyan);
      border: 1px solid rgba(14, 165, 233, 0.3);
      font-family: var(--font-mono);
      letter-spacing: 0.02em;
    }
    .role-tag.employer-tag {
      background: rgba(210, 248, 39, 0.12);
      color: var(--accent-primary);
      border-color: rgba(210, 248, 39, 0.3);
    }
    .role-tag.admin-tag {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .user-drop-actions {
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .drop-action-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.55rem 0.75rem;
      border-radius: var(--radius-md);
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);
    }
    .drop-action-item:hover {
      background: var(--bg-surface);
      color: var(--text-primary);
    }
    .drop-counter {
      background: var(--accent-primary);
      color: var(--accent-primary-text);
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.1rem 0.45rem;
      border-radius: var(--radius-full);
      font-family: var(--font-mono);
    }
    .user-drop-footer {
      padding: 0.5rem;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-surface);
    }
    .sign-out-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.55rem 0.75rem;
      border-radius: var(--radius-md);
      background: none;
      border: none;
      color: #ef4444;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .sign-out-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--accent-primary);
      color: var(--accent-primary-text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .user-avatar.employer-avatar {
      background: var(--brand-gradient);
    }

    .hamburger-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }
    .hamburger-btn:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-hover);
      color: var(--accent-primary);
    }
    .theme-toggle-btn {
      min-width: 44px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 90;
    }
    .mobile-drawer {
      position: fixed;
      top: 65px;
      left: 1rem;
      right: 1rem;
      max-height: calc(100vh - 85px);
      overflow-y: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-lg);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .mobile-drawer-links {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .mobile-drawer-btn, .mobile-drawer-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 44px;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);
    }
    .mobile-drawer-btn:hover, .mobile-drawer-link:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-card);
      color: var(--accent-primary);
    }
    .mobile-drawer-btn.active {
      background: var(--accent-primary-subtle);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      font-weight: 700;
    }
    .btn-post-mobile {
      background: var(--accent-primary);
      color: var(--accent-primary-text);
      border-color: var(--accent-primary);
      justify-content: center;
      font-weight: 700;
    }
    .mobile-drawer-footer {
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .mobile-user-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .mobile-guest-actions {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .w-full {
      width: 100%;
      min-height: 44px;
    }
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .desktop-auth-btn { display: none; }
      .desktop-user-pill { display: none; }
      .hamburger-btn { display: inline-flex; }
      .nav-container {
        padding: 0.65rem 1rem;
        gap: 0.75rem;
      }
      .brand-title {
        font-size: 1.15rem;
      }
    }
  `]
})
export class NavbarComponent {
  public readonly auth = inject(AuthService);
  public readonly seekerService = inject(SeekerService);
  public readonly employerService = inject(EmployerService);
  public readonly notificationService = inject(NotificationService);
  public readonly themeService = inject(ThemeService);

  public readonly activeTab = input<NavTab>('explore');
  public readonly activeTabChange = output<NavTab>();
  public readonly openAuth = output<'login' | 'register'>();
  public readonly openPostJob = output<void>();

  public readonly isNotificationDropdownOpen = signal<boolean>(false);
  public readonly isUserDropdownOpen = signal<boolean>(false);
  public readonly isMobileMenuOpen = signal<boolean>(false);

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isNotificationDropdownOpen.set(false);
    this.isUserDropdownOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.isUserDropdownOpen.set(!this.isUserDropdownOpen());
    if (this.isUserDropdownOpen()) {
      this.isNotificationDropdownOpen.set(false);
    }
  }

  onMobileTabSelect(tab: NavTab): void {
    this.activeTabChange.emit(tab);
    this.isMobileMenuOpen.set(false);
  }

  onMobileScrollTo(sectionId: string, event: Event): void {
    this.scrollTo(sectionId, event);
    this.isMobileMenuOpen.set(false);
  }

  onMobileForEmployers(event: Event): void {
    this.onForEmployersClick(event);
    this.isMobileMenuOpen.set(false);
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationDropdownOpen.set(!this.isNotificationDropdownOpen());
  }

  onBrandClick(): void {
    if (this.auth.isAdmin()) {
      this.activeTabChange.emit('admin');
    } else if (this.auth.isEmployer()) {
      this.activeTabChange.emit('employer-dashboard');
    } else {
      this.activeTabChange.emit('explore');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    if (this.activeTab() !== 'explore') {
      this.activeTabChange.emit('explore');
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }

  onForEmployersClick(event: Event): void {
    event.preventDefault();
    if (this.auth.isEmployer()) {
      this.activeTabChange.emit('employer-dashboard');
    } else {
      this.scrollTo('for-employers', event);
    }
  }

  formatTime(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }
}

