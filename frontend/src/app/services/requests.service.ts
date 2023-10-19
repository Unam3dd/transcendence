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
  getUserData(): Observable<UserInterface> | null {
    //Recovers Cookie and gives authorization
    const token = this.cookieService.getToken();

    if (!token) return (null);

    //ID recovery
    const userId = this.getId(token);

    //Return of data recovery
    return this.http.get<UserInterface>(`${NESTJS_URL}/users/${userId}`, { headers: 
      new HttpHeaders().append('authorization', token) });
  }

  getLoggedUserInformation(): Observable<UserInterface> | null {

    const JWT_TOKEN = this.cookieService.getToken();

    if (!JWT_TOKEN) return (null);

    const url = `${NESTJS_URL}/users/me`;

    return (this.http.get<UserInterface>(url, { 
      headers: new HttpHeaders().append('authorization', JWT_TOKEN) }));
  }

  //Change user nickname
  updateUserHomeData(newNickname: string, email: string): Observable<string> | undefined {

    const token = this.cookieService.getToken()

    if (!token) return ;

    const { id, login } = <UserSanitizeInterface>JSON.parse(atob(token.split('.')[1]));

    if (newNickname.trim() === '') {
        return this.updateUserHomeData(login, email);
    } else {
      const updateData = {id: id, nickName: newNickname, email: email};
      return this.http.put<string>(`${NESTJS_URL}/users`, updateData, {headers: 
        new HttpHeaders().append('authorization', `Bearer ${token}`)});
    }
  }
  
  async updateUserDatas(firstname: string, lastname: string, nickname: string, email: string, a2f: boolean) {
    console.log(firstname, lastname, nickname, email, a2f);
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
