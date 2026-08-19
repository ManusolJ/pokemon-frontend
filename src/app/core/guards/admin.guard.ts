import { ROLE_ADMIN } from '@shared/constants/auth.constants';

import { TokenService } from '@core/services/token.service';
import { TokenRefreshService } from '@core/services/token-refresh.service';

import { catchError, map, Observable, of } from 'rxjs';

import { inject } from '@angular/core';

import { Router, CanActivateFn, UrlTree } from '@angular/router';

export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const refreshService = inject(TokenRefreshService);

  const loginRedirect = () =>
    router.createUrlTree(['/auth/login'], {
      queryParams: { redirectTo: state.url },
    });

  const roleCheck = () => (tokenService.hasRole(ROLE_ADMIN) ? true : router.createUrlTree(['/']));

  if (!tokenService.isAuthenticated()) {
    return loginRedirect();
  }

  if (!tokenService.willExpireSoon()) {
    return roleCheck();
  }

  return renewThen(refreshService, roleCheck, loginRedirect);
};

function renewThen(
  refreshService: TokenRefreshService,
  roleCheck: () => boolean | UrlTree,
  loginRedirect: () => UrlTree,
): Observable<boolean | UrlTree> {
  return refreshService.refresh().pipe(
    map(() => roleCheck()),
    catchError(() => of(loginRedirect())),
  );
}
