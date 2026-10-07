import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:5263/api/auth';

  constructor(private http: HttpClient) {}

  register(request: {
    email: string;
    password: string;
  }): Observable<{ message: string }> {

    return this.http.post<{ message: string }>(
      `${this.apiUrl}/register`,
      request
    );
  }

  login(request: {
    email: string;
    password: string;
  }): Observable<{ message: string }> {

    return this.http.post<{ message: string }>(
      `${this.apiUrl}/login`,
      request
    );
  }
}