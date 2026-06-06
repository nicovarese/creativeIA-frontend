import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type BrandLoraStatus = 'PENDING' | 'TRAINING' | 'COMPLETED' | 'FAILED';

export interface BrandLoraDto {
  id: string;
  name: string;
  triggerWord: string;
  status: BrandLoraStatus;
  progress: number;
  errorMessage?: string | null;
  imageCount: number;
  createdAt: string;
  completedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class BrandLoraService {
  private readonly baseUrl = `${environment.apiBaseUrl}/brand-loras`;

  constructor(private http: HttpClient) {}

  list(): Observable<BrandLoraDto[]> {
    return this.http.get<BrandLoraDto[]>(this.baseUrl);
  }

  get(id: string): Observable<BrandLoraDto> {
    return this.http.get<BrandLoraDto>(`${this.baseUrl}/${id}`);
  }

  create(name: string, triggerWord: string, files: File[]): Observable<BrandLoraDto> {
    const fd = new FormData();
    fd.append('payload', JSON.stringify({ name, triggerWord }));
    for (const f of files) fd.append('images', f, f.name);
    return this.http.post<BrandLoraDto>(this.baseUrl, fd);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
