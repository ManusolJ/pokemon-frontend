import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/admin/layout/admin-layout').then((mod) => mod.AdminLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'users',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('@features/admin/components/user-list/user-list').then((mod) => mod.UserList),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('@features/admin/components/user-edit/user-edit').then((mod) => mod.UserEdit),
      },
      {
        path: 'seed',
        loadComponent: () =>
          import('@features/admin/components/admin-seed/admin-seed').then((mod) => mod.AdminSeed),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('@features/admin/components/admin-logs/admin-logs').then((mod) => mod.AdminLogs),
      },
    ],
  },
];
