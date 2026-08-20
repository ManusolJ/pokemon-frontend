import { Routes } from '@angular/router';

export const TEAM_BUILDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/team-builder/layout/team-builder-layout').then((m) => m.TeamBuilderLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'builder',
      },
      {
        path: 'builder',
        title: 'Team Builder',
        data: {
          description:
            'Draft a team of up to six Pokemon with held items, natures, abilities, Tera types and full EV and IV spreads. No account needed to start.',
        },
        loadComponent: () =>
          import('@features/team-builder/components/builder-tab/builder-tab').then(
            (m) => m.BuilderTab,
          ),
      },
      {
        path: 'analysis',
        title: 'Team Analysis',
        data: {
          description:
            'Check your team for offensive and defensive type coverage, role balance and combined base stats.',
        },
        loadComponent: () =>
          import('@features/team-builder/components/analysis-tab/analysis-tab').then(
            (m) => m.AnalysisTab,
          ),
      },
    ],
  },
];
