import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, LogoutRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);

  private readonly api = 'http://localhost:3000/api';

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, credentials, {
      withCredentials: true,
    });
  }

  logout(body: LogoutRequest): Observable<unknown> {
    return this.http.post(`${this.api}/auth/logout`, body, {
      withCredentials: true,
    });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/refresh`, {}, {
      withCredentials: true,
    });
  }

  providerUrl(provider: string): string {
    return `${this.api}/auth/${provider}`;
  }
}
