import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  //Decode Jwt Token and get sub three part
  decode(token: string): string[] {
    const [ header, payload, signature ] = token.split('.') ?? [];
    return [atob(header), atob(payload), signature];
  }
}
