import { Injectable } from '@angular/core';
import { TokenInterface } from '../interfaces/token.interface';
import { isJWT } from 'class-validator';

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

  getToken(): string | null {
    const authorization = this.getCookie('authorization');

    if (!authorization) return (null);

    const [type, token] = decodeURI(authorization).split(' ') ?? [];

      if (type !== 'Bearer' || !isJWT(token)) return (null);

    return (token);
  }
}
