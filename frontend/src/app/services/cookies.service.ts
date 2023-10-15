import { Injectable } from '@angular/core';

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
}
