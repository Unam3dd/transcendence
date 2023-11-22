import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CookiesService } from './services/cookies.service';

function checkAuth(): boolean {
  const cookieService = inject(CookiesService);

  const token = cookieService.getToken();
  if (!token)
    return false;
  else
    return true
}

export const routeGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const router = inject(Router);

  if (checkAuth())
    return true;
  else
    return router.createUrlTree(['/']);
};

export const loginGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const router = inject(Router);

  if (checkAuth())
    return router.createUrlTree(['/home']);
  else
    return true;
};