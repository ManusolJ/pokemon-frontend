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
        loadComponent: () =>
          import('@features/team-builder/components/builder-tab/builder-tab').then(
            (m) => m.BuilderTab,
          ),
      },
      {
        path: 'analysis',
        loadComponent: () =>
          import('@features/team-builder/components/analysis-tab/analysis-tab').then(
            (m) => m.AnalysisTab,
          ),
      },
    ],
  },
];
