import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from "@angular/common/http";
import {Observable, catchError, switchMap, throwError} from "rxjs";
import {CookiesService} from "./cookies.service";
import {JwtService} from "./jwt.service";
import { NESTJS_URL } from '../env';
import { UserInterface, UserSanitizeInterface } from '../interfaces/user.interface'
import { JWT_PAYLOAD } from './jwt.const';
import { Friends } from '../interfaces/friends.interface';
@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(private http: HttpClient, private readonly cookieService: CookiesService, private jwtService: JwtService) {}

  //Handle requests errors
  private handleError(error: HttpErrorResponse){
    if (error.status === 0){
      console.error("an error occured");
    }
    else {
      console.error(`Request returned an ${error.status} error`)
    }
    return throwError(() => new Error ('Request error!!'));
  }

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

    const url = `${NESTJS_URL}/users/me`;

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

  // Get sanitazed informations about one user
  getUserInfo(userId: number) : Observable<UserSanitizeInterface>
  {
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    const url:string = `${NESTJS_URL}/users/${userId}`;

    return this.http.get<UserSanitizeInterface>(url, {headers: hdr}).pipe(catchError(this.handleError));
  }


  /* Friends Resquests */


  addFriends(targetId: number) {
    // getting the request header
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    const userId = this.getId(token);

    // making the request
    const url:string = `${NESTJS_URL}/friends/add`;

    const addFriendsBody = { user1: userId, user2: targetId};

    return this.http.post(url, addFriendsBody, {headers: hdr}).pipe(catchError(this.handleError));
  }

  updateFriendsStatus(applicant: number) {
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    const userId = this.getId(token);

    const url:string = `${NESTJS_URL}/friends/update/${applicant}/${userId}`;

    return this.http.patch(url, null, {headers: hdr}).pipe(catchError(this.handleError));
  }

  listFriends(approved: boolean): Observable<Friends[]> {
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    const userId = this.getId(token);

    //Setting request param, print all friends on false, print only approved friends on true
    const param = new HttpParams().set('approved', approved);

    const url:string = `${NESTJS_URL}/friends/list/${userId}`;

    return this.http.get<Friends[]>(url, {headers: hdr, params: param}).pipe(catchError(this.handleError));
  }

  deleteFriends(friendId: number) {
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];

    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);

    const userId = this.getId(token);

    const url:string = `${NESTJS_URL}/friends/delete/${userId}/${friendId}`;

    return this.http.delete(url, {headers: hdr}).pipe(catchError(this.handleError));
  }
}
