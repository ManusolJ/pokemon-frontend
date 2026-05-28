import { ROLE_ADMIN } from '@shared/constants/auth.constants';

import { TokenService } from '@core/services/token.service';

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (tokenService.isAuthenticated() && tokenService.hasRole(ROLE_ADMIN)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
