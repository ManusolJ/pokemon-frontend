import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/auth/layout/auth-layout').then((mod) => mod.AuthLayout),
    children: [
      {
        path: 'login',
        title: 'Sign In',
        loadComponent: () =>
          import('@features/auth/components/login/login').then((mod) => mod.Login),
      },
      {
        path: 'registration',
        title: 'Create Account',
        loadComponent: () =>
          import('@features/auth/components/registration/registration').then(
            (mod) => mod.Registration,
          ),
      },
      {
        path: 'reset-password-request',
        title: 'Reset Password',
        loadComponent: () =>
          import('@features/auth/components/reset-password-request/reset-password-request').then(
            (mod) => mod.ResetPasswordRequest,
          ),
      },
      {
        path: 'reset-password-confirmation',
        title: 'Reset Password',
        loadComponent: () =>
          import('@features/auth/components/reset-password-confirmation/reset-password-confirmation').then(
            (mod) => mod.ResetPasswordConfirmation,
          ),
      },
    ],
  },
];
