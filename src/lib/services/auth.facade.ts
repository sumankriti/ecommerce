import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, LogoutRequest, OAuthProvider, UserModel } from '../models/auth.model';
import { AuthApiService } from './auth-api.service';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private authApi = inject(AuthApiService);

  private readonly userState = signal<UserModel | null>(null);
  private autoRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly userRoles = computed(() => this.userState()?.roles ?? []);
  readonly isAdmin = computed(() =>
    this.userRoles().some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role)),
  );

  refreshTokenInProgress = false;
  readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    const token = this.tokenService.get();
    if (token && !this.tokenService.isExpired()) {
      this.hydrateUser(token);
      this.scheduleAutoRefresh();
    }

    effect(() => {
      if (!this.isAuthenticated()) {
        this.clearAutoRefreshTimer();
      }
    });
  }

  login(credentials: LoginRequest): Observable<void> {
    return this.authApi.login(credentials).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      map(() => void 0),
    );
  }

  logout(everywhere = false): void {
    this.clearLocalState();

    const body: LogoutRequest = { everywhere };
    this.authApi
      .logout(body)
      .pipe(catchError(() => throwError(() => null)))
      .subscribe();

    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<string> {
    return this.authApi.refreshToken().pipe(
      tap((response) => this.handleAuthSuccess(response)),
      map((response) => response.accessToken),
      catchError((err) => {
        this.clearLocalState();
        this.router.navigate(['/login']);
        return throwError(() => err);
      }),
    );
  }

  loginWithProvider(provider: OAuthProvider): void {
    const returnUrl = this.router.url === '/login' ? '/dashboard' : this.router.url;
    sessionStorage.setItem('oauth_return_url', returnUrl);
    window.location.href = this.authApi.providerUrl(provider);
  }

  handleOAuthCallback(accessToken: string): void {
    this.handleAuthSuccess({ accessToken });
    const returnUrl = sessionStorage.getItem('oauth_return_url') ?? '/dashboard';
    sessionStorage.removeItem('oauth_return_url');
    this.router.navigateByUrl(returnUrl);
  }

  getAccessToken(): string | null {
    return this.tokenService.get();
  }

  hasAnyRole(roles: string[]): boolean {
    return this.tokenService.hasAnyRole(roles);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.tokenService.set(response.accessToken);
    this.hydrateUser(response.accessToken);
    this.scheduleAutoRefresh();
  }

  private hydrateUser(token: string): void {
    const payload = this.tokenService.decode(token);
    if (!payload) return;

    this.userState.set({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles ?? [],
    });
  }

  private clearLocalState(): void {
    this.tokenService.clear();
    this.userState.set(null);
    this.refreshTokenInProgress = false;
    this.refreshTokenSubject.next(null);
    this.clearAutoRefreshTimer();
  }

  private scheduleAutoRefresh(): void {
    this.clearAutoRefreshTimer();

    const secondsLeft = this.tokenService.secondsUntilExpiry();
    if (secondsLeft <= 0) return;

    const refreshInMs = Math.max(0, (secondsLeft - 60) * 1000);
    this.autoRefreshTimer = setTimeout(() => {
      if (!this.isAuthenticated()) return;

      this.refreshToken().subscribe({
        error: () => {
          // The interceptor or next protected request will complete logout flow.
        },
      });
    }, refreshInMs);
  }

  private clearAutoRefreshTimer(): void {
    if (this.autoRefreshTimer !== null) {
      clearTimeout(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }
}
