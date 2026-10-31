import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/teams/layout/team-layout').then((mod) => mod.TeamLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'shared-teams',
      },
      {
        path: 'shared-teams',
        title: 'Community Teams',
        data: {
          description:
            'Browse Pokémon teams shared by the community, see their full rosters and copy any of them into the builder.',
        },
        loadComponent: () =>
          import('@features/teams/components/lists/public-team-list/public-team-list').then(
            (mod) => mod.PublicTeamList,
          ),
      },
      {
        path: 'shared-teams/:id',
        data: { mode: 'public' },
        loadComponent: () =>
          import('@features/teams/components/detail/team-detail/team-detail').then(
            (mod) => mod.TeamDetail,
          ),
      },
      {
        path: 'my-teams',
        title: 'Your Teams',
        canActivate: [authGuard],
        loadComponent: () =>
          import('@features/teams/components/lists/private-team-list/private-team-list').then(
            (mod) => mod.PrivateTeamList,
          ),
      },
      {
        path: 'my-teams/:id',
        canActivate: [authGuard],
        data: { mode: 'own' },
        loadComponent: () =>
          import('@features/teams/components/detail/team-detail/team-detail').then(
            (mod) => mod.TeamDetail,
          ),
      },
      {
        // Read-only share link; works for private teams, so no guard and no indexing.
        path: 's/:slug',
        title: 'Shared team',
        data: { mode: 'shared', noindex: true },
        loadComponent: () =>
          import('@features/teams/components/detail/team-detail/team-detail').then(
            (mod) => mod.TeamDetail,
          ),
      },
    ],
  },
];
