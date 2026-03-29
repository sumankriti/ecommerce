import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
  },
];
