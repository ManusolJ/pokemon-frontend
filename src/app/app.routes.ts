import { authGuard } from '@core/guards/auth.guard';
import { adminGuard } from '@core/guards/admin.guard';

import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'team-builder',
  },
  {
    path: 'team-builder',
    loadChildren: () =>
      import('@features/team-builder/routes/team-builder.routes').then(
        (mod) => mod.TEAM_BUILDER_ROUTES,
      ),
  },
  {
    path: 'pokedex',
    loadChildren: () =>
      import('@features/pokedex/routes/pokedex.routes').then((mod) => mod.POKEDEX_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/routes/auth.routes').then((mod) => mod.AUTH_ROUTES),
  },
  {
    path: 'teams',
    loadChildren: () => import('@features/teams/routes/teams.routes').then((m) => m.TEAMS_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('@features/admin/routes/admin.routes').then((mod) => mod.ADMIN_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('@features/profile/profile').then((mod) => mod.Profile),
  },
  {
    path: 'about',
    loadComponent: () => import('@features/about/about').then((mod) => mod.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('@features/contact/contact').then((mod) => mod.Contact),
  },
  {
    path: '**',
    redirectTo: 'team-builder',
  },
];
