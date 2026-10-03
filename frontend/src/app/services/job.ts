import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Job } from '../models/job';

@Injectable({
  providedIn: 'root',
})
export class JobService {

  private apiUrl = 'http://localhost:5263/api/jobs';

  constructor(private http: HttpClient) {}

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getJob(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  createJob(job: {
    title: string;
    company: string;
    location: string;
    jobType: string;
    description: string;
    salary: number;
  }): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  updateJob(
    id: number,
    job: {
      title: string;
      company: string;
      location: string;
      jobType: string;
      description: string;
      salary: number;
    }
  ): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}