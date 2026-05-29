import { Routes } from '@angular/router';
import { AuthLayout } from '../layout/auth-layout';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@features/auth/components/login/login').then((mod) => mod.Login),
      },
      {
        path: 'registration',
        loadComponent: () =>
          import('@features/auth/components/registration/registration').then(
            (mod) => mod.Registration,
          ),
      },
      {
        path: 'reset-password-request',
        loadComponent: () =>
          import('@features/auth/components/reset-password-request/reset-password-request').then(
            (mod) => mod.ResetPasswordRequest,
          ),
      },
      {
        path: 'reset-password-confirmation',
        loadComponent: () =>
          import('@features/auth/components/reset-password-confirmation/reset-password-confirmation').then(
            (mod) => mod.ResetPasswordConfirmation,
          ),
      },
    ],
  },
];
