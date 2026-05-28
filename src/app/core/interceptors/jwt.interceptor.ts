import { environment } from '@environments/environment';

import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';

import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { inject } from '@angular/core';

import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';

const refreshTokenSubject = new BehaviorSubject<string | null>(null);

let isRefreshing: boolean = false;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);

  if (!req.url.startsWith(environment.apiUrl) || req.url.includes('/auth/')) {
    return next(req);
  }

  const token = tokenService.getAccessToken();

  if (token && tokenService.willExpireSoon() && tokenService.getRefreshToken()) {
    return handleTokenRefresh(req, next, authService);
  }

  const authedReq = token ? addToken(req, token) : req;

  return next(authedReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        return handleTokenRefresh(req, next, authService);
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

function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
) {
  if (!isRefreshing) {
    isRefreshing = true;

    return authService.refreshAccessToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        return next(addToken(req, response.accessToken));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout().subscribe({ error: () => {} });
        return throwError(() => error);
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addToken(req, token))),
  );
}
