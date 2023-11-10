import { Injectable } from '@angular/core';
import { isJWT } from 'class-validator';
import { LOGIN_PAGE } from '../env';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {

  private cookies = document.cookie.split(' ');

  constructor() { this.getCookies(); }

  getCookies() {
    return (this.cookies);
  }

  getCookie(name: string): string | null {
    for (const cookie of this.cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) return (value);
    }
    return (null);
  }

  setCookie(key: string, value: string) {
    document.cookie = `${key}=${encodeURI(value)}`;
  }

  removeCookie(key: string) {
    document.cookie = `${key}=;expires=${new Date(0).toUTCString()}; Path=/`;
    window.location.href = `${LOGIN_PAGE}`;
  }

  getToken(): string | null {
    const authorization = this.getCookie('authorization');

    if (!authorization) return (null);

    const [type, token] = decodeURI(authorization).split(' ') ?? [];

      if (type !== 'Bearer' || !isJWT(token)) return (null);

    return (token);
  }
}
