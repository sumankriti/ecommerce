import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@ecommerce/core/guards';
import { AppShellComponent } from '@ecommerce/shared-ui';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('@ecommerce/features-auth').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@ecommerce/features-dashboard').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPER_ADMIN'] },
        loadChildren: () =>
          import('@ecommerce/features-dashboard').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'rxjs',
        loadChildren: () =>
          import('@ecommerce/features-rxjs').then((m) => m.routes),
      }
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
