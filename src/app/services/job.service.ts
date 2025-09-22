import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Job {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED' | string;
  provider?: string;
  templateKey?: string;
  templateVer?: string;
  compiledJson?: string;
  errorMessage?: string;
  updatedAt?: string;
  assets?: { url: string; width?: number; height?: number }[];
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  createJob(body: any): Observable<any> { return this.http.post(`${this.api}/generate`, body); }
  getJob(id: string): Observable<Job> { return this.http.get<Job>(`${this.api}/jobs/${id}`); }
}
