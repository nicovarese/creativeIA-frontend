import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, timer, throwError } from 'rxjs';
import { catchError, switchMap, takeWhile } from 'rxjs/operators';

import {
  CreateJobRequestDto,
  JobResponseDto
} from '../models/job.models';

@Injectable({ providedIn: 'root' })
export class JobService {
  // environment.apiBaseUrl debe ser 'http://localhost:8080/v1'
  private readonly base = `${environment.apiBaseUrl}/jobs`;

  constructor(private http: HttpClient) {}

  createJob(body: CreateJobRequestDto): Observable<JobResponseDto> {
    return this.http.post<JobResponseDto>(this.base, body).pipe(
      catchError(err => throwError(() => err?.error ?? { message: err.message }))
    );
  }

  getJob(id: string): Observable<JobResponseDto> {
    return this.http.get<JobResponseDto>(`${this.base}/${id}`).pipe(
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
