import { Routes } from '@angular/router';

export const PARENT_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history.component').then((m) => m.ParentHistoryComponent),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
  },
  {
    path: 'children',
    loadComponent: () =>
      import('./pages/children/children.component').then((m) => m.ChildrenComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
