import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Observable, switchMap} from "rxjs";
import {CookiesService} from "./cookies.service";
import {JwtService} from "./jwt.service";
import { NESTJS_URL } from '../env';
import { UserInterface } from '../interfaces/user.interface'


@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(private http: HttpClient, private readonly cookieService: CookiesService, private jwtService: JwtService) {}

  //Récupère l'ID de l'utilisateur
  getId(token: string): number {
    //Récupère un tableau de valeurs du JWT (header, payload, signature)
    const decodeToken = this.jwtService.decode(token);

    //Récupère uniquement le payload
    const payloadToken = decodeToken[1];

    try {
      //Transforme en JSON
      const jsonToken = JSON.parse(payloadToken);

      //Si "sub" (id) existe, alors c'est bon
      if (jsonToken && jsonToken.sub) {

        //Récupération de l'ID de l'utilisateur via JWT
        return jsonToken.sub;

      } else {
        throw new Error('"id" not found');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      throw error;
    }
  }

  //Récupère les données du user
  getUserData(): Observable<UserInterface> {
    //Récupère le Cookie et donne l'authorisation
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    //Récupération du header
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    //Récupération de l'id
    const userId = this.getId(token);

    //Retour de la récupération des données
    return this.http.get<UserInterface>(`${NESTJS_URL}/users/${userId}`, { headers: hdr });
  }

  getLoggedUserInformation(): Observable<UserInterface> | null {

    const JWT_TOKEN = this.cookieService.getCookie('authorization');

    if (!JWT_TOKEN) return (null);

    const hdr = new HttpHeaders().append('authorization', JWT_TOKEN);

    const url = `${NESTJS_URL}/users/me`

    return (this.http.get<UserInterface>(url, { headers: hdr }));
  }

  //Permet de modifier le nickname de l'utilisateur
  updateUserHomeData(newNickname: string, email: string): Observable<UserInterface>{

    //Récupère le Cookie et donne l'authorisation
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    //Récupération de l'id
    const userId = this.getId(token);

    //Récupération du header
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    if (newNickname.trim() === '') {              //Si newNickname est vide
      return this.getUserData().pipe(           //Fait appel à getData pour avoir le login
        switchMap((data: UserInterface) => {         //switchMap pour prendre en conpte la récupération du login dans un nouvel observable
          const loginValue: string = data.login;
          return this.updateUserHomeData(loginValue, email); //Récursion avec la valeur du login
        })
      );
    } else {
      const updateData = {id: userId, nickName: newNickname, email: email};
      return this.http.put<UserInterface>(`${NESTJS_URL}/users`, updateData, {headers: hdr});
    }
  }
}
