import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, of, switchMap} from "rxjs";
import {CookiesService} from "./cookies.service";
import {JwtService} from "./jwt.service";


@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  private backUrl: string = 'http://localhost:3000/users';

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
  getUserData(): Observable<string> {
    //Récupère le Cookie et donne l'authorisation
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    //Récupération du header
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    //Récupération de l'id
    const userId = this.getId(token);

    //Définition de l'url totale
    const url = `${this.backUrl}/${userId}`;

    //Retour de la récupération des données
    return this.http.get<string>(url, { headers: hdr });
  }

  //Permet de modifier le nickname de l'utilisateur
  updateUserHomeData(newNickname: string, email: string): Observable<any>{

    //Récupère le Cookie et donne l'authorisation
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    //Récupération de l'id
    const userId = this.getId(token);

    //Récupération du header
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    //Définition de l'url totale
    const url = `${this.backUrl}`;

    if (newNickname.trim() === '') {              //Si newNickname est vide
      return this.getUserData().pipe(           //Fait appel à getData pour avoir le login
        switchMap((data: any) => {         //switchMap pour prendre en conpte la récupération du login dans un nouvel observable
          const loginValue: string = data.login;
          return this.updateUserHomeData(loginValue, email); //Récursion avec la valeur du login
        })
      );
    } else {
      const updateData = {id: userId, nickName: newNickname, email: email};
      return this.http.put(url, updateData, {headers: hdr});
    }
  }

  updateUserDatas(firstname: string, lastname: string, nickname: string, email: string, a2f: boolean ) {
    //Récupère le Cookie et donne l'authorisation
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    //Récupération de l'id
    const userId = this.getId(token);

    //Récupération du header
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    //Définition de l'url totale
    const url = `${this.backUrl}`;

    const updateData: any = {id: userId};

    if (firstname) {
      updateData.firstName = firstname;
    }
    if (lastname) {
      updateData.lastName = lastname;
    }
    if (nickname) {
      updateData.nickName = nickname;
    }
    if (email) {
      updateData.email = email;
    }
    if (a2f) {
      updateData.a2f = a2f;
    }

    //Modifie les champs non vide
    if (Object.keys(updateData).length > 1){
      return this.http.put(url, updateData, {headers: hdr});
    } else {
      return of(); //Retourne un observable vide si aucune données
    }
  }
}
