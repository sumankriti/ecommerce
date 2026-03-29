import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../services/auth.facade';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  const requiredRoles: string[] = route.data['roles'] ?? [];

  if (!requiredRoles.length) return true;
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  if (auth.hasAnyRole(requiredRoles)) return true;

  return router.createUrlTree(['/login']);
};
