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

  getCookie(name: string): string {
    for (let cookie of this.cookies) {
      let [key, value] = cookie.split('=');
      if (key === name) return (value);
    }
    return ('');
  }
}
