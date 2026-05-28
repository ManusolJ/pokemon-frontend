import { TokenService } from '@core/services/token.service';

import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (tokenService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
