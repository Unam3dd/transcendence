import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor() {}

  //Décode le JWT en récupérant les différentes parties
  decode(token: string): string[] {
    if (token === '') return ([]);

    const [ header, payload, signature ] = token.split('.') ?? [];
    return [atob(header), atob(payload), signature];
  }
}
