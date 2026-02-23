import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface AuthUserDto {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponseDto {
  token: string;
  user: AuthUserDto;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  login(body: LoginRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/login`, body).pipe(
      tap(r => this.setToken(r.token))
    );
  }

  register(body: RegisterRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/register`, body).pipe(
      tap(r => this.setToken(r.token))
    );
  }

  me(): Observable<AuthUserDto> {
    return this.http.get<AuthUserDto>(`${this.baseUrl}/me`);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  private setToken(token: string) {
    if (token) localStorage.setItem(this.tokenKey, token);
  }
}
