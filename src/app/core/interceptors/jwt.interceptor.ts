import { environment } from '@environments/environment';

import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { TokenRefreshService } from '@core/services/token-refresh.service';

import { catchError, switchMap, throwError } from 'rxjs';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const refreshService = inject(TokenRefreshService);

  if (!req.url.startsWith(environment.apiUrl) || req.url.includes('/auth/')) {
    return next(req);
  }

  const token = tokenService.getAccessToken();

  if (!token) {
    return next(req);
  }

  if (tokenService.willExpireSoon() && tokenService.hasRefreshToken()) {
    return refreshAndRetry(req, next, refreshService, authService, router);
  }

  return next(addToken(req, token)).pipe(
    catchError((error) => {
      const unauthorized = error instanceof HttpErrorResponse && error.status === 401;

      if (unauthorized && tokenService.hasRefreshToken()) {
        return refreshAndRetry(req, next, refreshService, authService, router);
      }

      return throwError(() => error);
    }),
  );
};

function addToken(req: HttpRequest<unknown>, token: string) {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function refreshAndRetry(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  refreshService: TokenRefreshService,
  authService: AuthService,
  router: Router,
) {
  return refreshService.refresh().pipe(
    catchError((error) => {
      authService.logout().subscribe({ error: () => {} });
      router.navigate(['/auth/login']);
      return throwError(() => error);
    }),
    switchMap((accessToken) => next(addToken(req, accessToken))),
  );
}
