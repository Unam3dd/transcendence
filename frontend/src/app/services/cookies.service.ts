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
  
  setCookie(name: string, value: string) {
    
    for (let i = 0; i < this.cookies.length; i++) {
      const [ key ] = this.cookies[i].split('=');
      if (key === name) this.cookies[i].split("=")[1] = value;
    }

    document.cookie = this.cookies.join(' ');
  }

  getCookie(name: string): string {
    for (let cookie of this.cookies) {
      let [key, value] = cookie.split('=');
      if (key === name) return (value);
    }
    return ('');
  }
}
