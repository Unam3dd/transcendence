import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpErrorResponse} from "@angular/common/http";
import {Observable, catchError, switchMap, throwError} from "rxjs";
import {CookiesService} from "./cookies.service";
import {JwtService} from "./jwt.service";
import { NESTJS_URL } from '../env';
import { UserInterface } from '../interfaces/user.interface'
import { JWT_PAYLOAD } from './jwt.const';


@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(private http: HttpClient, private readonly cookieService: CookiesService, private jwtService: JwtService) {}

  //Handle requests errors
  private handleError(error: HttpErrorResponse){
    if (error.status === 0){
      console.log("an error occured");
    }
    else {
      console.log(`Request returned an ${error.status} error`)
    }
    return throwError(() => new Error ('Request error!!'));
  }

  //Récupère l'ID de l'utilisateur
  getId(token: string): number | null {
    //Récupère un tableau de valeurs du JWT (header, payload, signature)
    const decodeToken = this.jwtService.decode(token);

    if (!decodeToken) return (null);

    //Récupère uniquement le payload
    const payloadToken = decodeToken[JWT_PAYLOAD];

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

    const url = `${NESTJS_URL}/users/me`;

    return (this.http.get<UserInterface>(url, { headers: hdr }));
  }

  //Permet de modifier le nickname de l'utilisateur
  updateUserHomeData(newNickname: string, email: string): Observable<string> {

    //Récupère le Cookie et donne l'authorisation
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    //Récupération de l'id
    const userId = this.getId(token);

    //Récupération du header
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    if (newNickname.trim() === '') {              //Si newNickname est vide
      return this.getUserData().pipe(           //Fait appel à getData pour avoir le login
        switchMap((data: UserInterface) => {         //switchMap pour prendre en conpte la récupération du login dans un nouvel observable
          const loginValue: string = <string>data.login;
          return this.updateUserHomeData(loginValue, email); //Récursion avec la valeur du login
        })
      );
    } else {
      const updateData = {id: userId, nickName: newNickname, email: email};
      return this.http.put<string>(`${NESTJS_URL}/users`, updateData, {headers: hdr});
    }
  }

  updateFriendsStatus(applicant: number)
  {
    // getting the request header
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    const userId = this.getId(token);

    // making the request
    const url:string = `${NESTJS_URL}/friends/update/${applicant}/${userId}`;
    return this.http.patch(url, null, {headers: hdr}).pipe(catchError(this.handleError));
  }

  deleteFriends(userId1: number, userId2: number)
  {
    // getting the request header
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    // making the request
    const url:string = `${NESTJS_URL}/friends/delete/${userId1}/${userId2}`;
    this.http.delete(url, {headers: hdr}).subscribe();
  }

  async updateUserDatas(firstname: string, lastname: string, nickname: string, email: string, a2f: boolean) {
    console.log(firstname, lastname, nickname, email, a2f);
  }
}
