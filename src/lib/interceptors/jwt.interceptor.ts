import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthFacade } from '../services/auth.facade';

const AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout'];

const isAuthUrl = (url: string): boolean => AUTH_URLS.some((path) => url.includes(path));

const withBearer = (req: HttpRequest<unknown>, token: string): HttpRequest<unknown> =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthFacade);

  if (isAuthUrl(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const authReq = token ? withBearer(req, token) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401(req, next, authService);
      }

      return throwError(() => error);
    }),
  );
};

function handle401(
  originalReq: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthFacade,
): Observable<HttpEvent<unknown>> {
  if (authService.refreshTokenInProgress) {
    return authService.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(withBearer(originalReq, token!))),
    );
  }

  authService.refreshTokenInProgress = true;
  authService.refreshTokenSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap((newToken) => {
      authService.refreshTokenInProgress = false;
      authService.refreshTokenSubject.next(newToken);
      return next(withBearer(originalReq, newToken));
    }),
    catchError((err) => {
      authService.refreshTokenInProgress = false;
      return throwError(() => err);
    }),
  );
}
