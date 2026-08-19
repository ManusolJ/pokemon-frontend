import { TokenService } from '@core/services/token.service';
import { TokenRefreshService } from '@core/services/token-refresh.service';

import { catchError, map, Observable, of } from 'rxjs';

import { inject } from '@angular/core';

import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const refreshService = inject(TokenRefreshService);

  const loginRedirect = () =>
    router.createUrlTree(['/auth/login'], {
      queryParams: { redirectTo: state.url },
    });

  if (!tokenService.isAuthenticated()) {
    return loginRedirect();
  }

  if (!tokenService.willExpireSoon()) {
    return true;
  }

  return renew(refreshService, loginRedirect);
};

function renew(
  refreshService: TokenRefreshService,
  loginRedirect: () => UrlTree,
): Observable<boolean | UrlTree> {
  return refreshService.refresh().pipe(
    map(() => true),
    catchError(() => of(loginRedirect())),
  );
}
