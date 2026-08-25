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
            'Browse Pokemon teams shared by the community, see their full rosters and copy any of them into the builder.',
        },
        loadComponent: () =>
          import('@features/teams/components/lists/public-team-list/public-team-list').then(
            (mod) => mod.PublicTeamList,
          ),
      },
      {
        path: 'shared-teams/:id',
        loadComponent: () =>
          import('@features/teams/components/detail/public-team-detail/public-team-detail').then(
            (mod) => mod.PublicTeamDetail,
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
        loadComponent: () =>
          import('@features/teams/components/detail/private-team-detail/private-team-detail').then(
            (mod) => mod.PrivateTeamDetail,
          ),
      },
    ],
  },
];
