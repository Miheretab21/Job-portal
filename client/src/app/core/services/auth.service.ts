import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../models/auth.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);

  public readonly currentUser = signal<User | null>(null);
  public readonly token = signal<string | null>(this.getStoredToken());
  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly isEmployer = computed(() => this.currentUser()?.role === 2);
  public readonly isAdmin = computed(() => this.currentUser()?.role === 3);

  constructor() {
    const storedUser = localStorage.getItem('careerorbit_user');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch {
        this.logout();
      }
    }
  }

  private getStoredToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('careerorbit_token') : null;
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/v1/auth/login', credentials).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/v1/auth/register', data).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('careerorbit_token');
    localStorage.removeItem('careerorbit_refresh_token');
    localStorage.removeItem('careerorbit_user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('careerorbit_token', authResult.accessToken);
    localStorage.setItem('careerorbit_refresh_token', authResult.refreshToken);
    localStorage.setItem('careerorbit_user', JSON.stringify(authResult.user));
    this.token.set(authResult.accessToken);
    this.currentUser.set(authResult.user);
  }
}
