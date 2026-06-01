import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/admin/layout/admin-layout').then((mod) => mod.AdminLayout),
    children: [],
  },
];
