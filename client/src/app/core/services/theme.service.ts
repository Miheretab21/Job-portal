import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'careerorbit_theme';
  
  // Active theme signal: defaults to 'dark' to match the primary inspiration
  public readonly currentTheme = signal<AppTheme>(this.getInitialTheme());

  constructor() {
    // Automatically apply theme attribute and body class when theme signal changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  public toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  public setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch {
      // LocalStorage might be restricted in some environments
    }
  }

  public isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  public isLight(): boolean {
    return this.currentTheme() === 'light';
  }

  private getInitialTheme(): AppTheme {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as AppTheme | null;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;

      root.setAttribute('data-theme', theme);

      if (theme === 'dark') {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
      } else {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
      }
    }
  }
}
