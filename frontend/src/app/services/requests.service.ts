import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, switchMap} from "rxjs";
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

  //Get the user's id
  getId(token: string): number | null {
    //Retrieves an array of JWT values (header, payload, signature)
    const decodeToken = this.jwtService.decode(token);

    if (!decodeToken) return (null);

    //Retrieves payload only
    const payloadToken = decodeToken[JWT_PAYLOAD];

    try {
      //Transform on JSON
      const jsonToken = JSON.parse(payloadToken);

      //if "sub" (id) exist, then it's good
      if (jsonToken && jsonToken.sub) {

        //User ID retrieval via JWT
        return jsonToken.sub;

      } else {
        throw new Error('"id" not found');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      throw error;
    }
  }

  //Recovers user data
  getUserData(): Observable<UserInterface> {
    //Recovers Cookie and gives authorization
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    //Header recovery
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    //ID recovery
    const userId = this.getId(token);

    //Return of data recovery
    return this.http.get<UserInterface>(`${NESTJS_URL}/users/${userId}`, { headers: hdr });
  }

  getLoggedUserInformation(): Observable<UserInterface> | null {

    const JWT_TOKEN = this.cookieService.getCookie('authorization');

    if (!JWT_TOKEN) return (null);

    const hdr = new HttpHeaders().append('authorization', JWT_TOKEN);

    const url = `${NESTJS_URL}/users/me`

    return (this.http.get<UserInterface>(url, { headers: hdr }));
  }

  //Change user nickname
  updateUserHomeData(newNickname: string, email: string): Observable<string> {

    //Recovers Cookie and gives authorization
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    //Recovers ID
    const userId = this.getId(token);

    //Recovers header
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    if (newNickname.trim() === '') {              //if newNickname is empty
      return this.getUserData().pipe(           //Call getDate to get login
        switchMap((data: UserInterface) => {         //switchMap to take into account login recovery in a new observable
          const loginValue: string = <string>data.login;
          return this.updateUserHomeData(loginValue, email); //Recursion with login value
        })
      );
    } else {
      const updateData = {id: userId, nickName: newNickname, email: email};
      return this.http.put<string>(`${NESTJS_URL}/users`, updateData, {headers: hdr});
    }
  }

  async updateUserDatas(firstname: string, lastname: string, nickname: string, email: string, a2f: boolean) {
    console.log(firstname, lastname, nickname, email, a2f);
  }
}
