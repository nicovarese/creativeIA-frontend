import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, timer, throwError } from 'rxjs';
import { catchError, switchMap, takeWhile } from 'rxjs/operators';

import { CreateJobRequestDto, JobResponseDto } from '../models/job.models';

@Injectable({ providedIn: 'root' })
export class JobService {
  // environment.apiBaseUrl = 'http://localhost:8080/v1'
  private readonly generateUrl = `${environment.apiBaseUrl}/generate`;
  private readonly jobsUrl = `${environment.apiBaseUrl}/jobs`;

  constructor(private http: HttpClient) {}

  /** Si hay files -> multipart(payload + image[]). Si no -> JSON. */
  createJob(body: CreateJobRequestDto, files: File[] = []): Observable<JobResponseDto> {
    const hasFiles = (files?.length ?? 0) > 0;

    if (!hasFiles) {
      return this.http.post<JobResponseDto>(this.generateUrl, body).pipe(
        catchError(err => throwError(() => err?.error ?? { message: err.message }))
      );
    }

    const fd = new FormData();
    fd.append('payload', JSON.stringify(body));
    for (const f of files) {
      // IMPORTANTE: el backend espera @RequestPart("image") List<MultipartFile>
      fd.append('image', f, f.name);
    }

    return this.http.post<JobResponseDto>(this.generateUrl, fd).pipe(
      catchError(err => throwError(() => err?.error ?? { message: err.message }))
    );
  }

  getJob(id: string): Observable<JobResponseDto> {
    return this.http.get<JobResponseDto>(`${this.jobsUrl}/${id}`).pipe(
      catchError(err => throwError(() => err?.error ?? { message: err.message }))
    );
  }

  /** Polling cada `ms` hasta DONE/FAILED (incluye la última emisión) */
  pollJob(id: string, ms = 1500): Observable<JobResponseDto> {
    return timer(0, ms).pipe(
      switchMap(() => this.getJob(id)),
      takeWhile(r => r.status !== 'DONE' && r.status !== 'FAILED', true)
    );
  }
}
