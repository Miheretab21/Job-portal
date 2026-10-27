import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface FileUploadResponse {
  url: string;
  relativePath: string;
  fileName: string;
  size: number;
  contentType: string;
}

export interface UploadProgress {
  progress: number;
  response?: FileUploadResponse;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  uploadFile(file: File, folder: 'resumes' | 'logos' | 'general' = 'resumes'): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<FileUploadResponse>(
      `${this.api.baseUrl}/api/v1/files/upload?folder=${folder}`,
      formData
    );
  }

  uploadWithProgress(file: File, folder: 'resumes' | 'logos' | 'general' = 'resumes'): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const req = new HttpRequest(
      'POST',
      `${this.api.baseUrl}/api/v1/files/upload?folder=${folder}`,
      formData,
      { reportProgress: true }
    );

    return this.http.request<FileUploadResponse>(req).pipe(
      map((event: HttpEvent<FileUploadResponse>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? file.size;
          const progress = Math.round((100 * event.loaded) / total);
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, response: event.body ?? undefined };
        }
        return { progress: 0 };
      })
    );
  }

  deleteFile(fileUrl: string): Observable<void> {
    return this.http.delete<void>(
      `${this.api.baseUrl}/api/v1/files?fileUrl=${encodeURIComponent(fileUrl)}`
    );
  }
}
