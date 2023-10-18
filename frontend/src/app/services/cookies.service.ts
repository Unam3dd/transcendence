import { Injectable } from '@angular/core';
import { TokenInterface } from '../interfaces/token.interface';

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

  getToken(): TokenInterface | null {
    if (this.getCookie('authorization') === null) return (null);

    const [type, token] = this.getCookie('authorization')?.split(
        this.getCookie('authorization')?.includes('%20') ? '%20' : ' '
      ) ?? [];

    return (<TokenInterface>{type: type, token: token});
  }
}
