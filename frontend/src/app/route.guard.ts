import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CookiesService } from './services/cookies.service';
import * as JwtDecode from 'jwt-decode'

function checkAuth(): boolean {
  const cookieService = inject(CookiesService);

  const token = cookieService.getToken();
  if (!token)
    return false;

  const jwt = JwtDecode.jwtDecode(token);
  if (jwt.exp && Date.now() / 1000 > jwt.exp)
  {
    cookieService.removeCookie('authorization')
    return false;
  }

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