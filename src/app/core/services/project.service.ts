import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProjectDto {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProjectAssetDto {
  id: string;
  url: string;
  flow: string;
  favorite: boolean;
  mimeType?: string;
  createdAt: string;
}

export interface ProjectAssetsResponseDto {
  items: ProjectAssetDto[];
  page: number;
  size: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly baseUrl = `${environment.apiBaseUrl}/projects`;

  constructor(private http: HttpClient) {}

  listProjects(page = 0, size = 50): Observable<PageDto<ProjectDto>> {
    // Backend usa paginación Spring (base 0) para listado de proyectos.
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageDto<ProjectDto>>(this.baseUrl, { params });
  }

  createProject(name: string): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(this.baseUrl, { name });
  }

  listAssets(projectId: string, page = 1, size = 100, search?: string,
             favoritesOnly = false): Observable<ProjectAssetsResponseDto> {
    // Este endpoint usa page base 1 (contrato actual de ProjectsController).
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (search?.trim()) params = params.set('search', search.trim());
    if (favoritesOnly) params = params.set('favoritesOnly', 'true');
    return this.http.get<ProjectAssetsResponseDto>(`${this.baseUrl}/${projectId}/assets`, { params });
  }

  deleteAsset(projectId: string, assetId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}/assets/${assetId}`);
  }

  setFavorite(projectId: string, assetId: string, favorite: boolean): Observable<{ id: string; favorite: boolean }> {
    return this.http.patch<{ id: string; favorite: boolean }>(
      `${this.baseUrl}/${projectId}/assets/${assetId}/favorite`, { favorite });
  }
}
