import { ROLE_ADMIN } from '@shared/constants/auth.constants';

import { TokenService } from '@core/services/token.service';

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (!tokenService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { redirectTo: state.url },
    });
  }

  if (!tokenService.hasRole(ROLE_ADMIN)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
