import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpResponse } from "@angular/common/http";
import {Observable, catchError, throwError, Subscription } from "rxjs";

import {CookiesService} from "./cookies.service";
import {JwtService} from "./jwt.service";
import { NESTJS_URL } from '../env';
import { UserInterface, UserSanitizeInterface } from '../interfaces/user.interface'
import { JWT_PAYLOAD } from './jwt.const';
import { Friends } from '../interfaces/friends.interface';
import {Router} from "@angular/router";
import { Status } from '../enum/status.enum';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  //Used for updateUserDatas
  private updateSubscription: Subscription | undefined;

  constructor(private http: HttpClient,
              private readonly cookieService: CookiesService,
              private jwtService: JwtService,
              private router: Router) {}

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
      headers: new HttpHeaders().append('authorization', `Bearer ${JWT_TOKEN}`) }));
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

    //unsubscribe for avoid memory leaks
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }

    //Recovers Cookie and gives authorization
    const token = this.cookieService.getToken();

    if (!token) return ;

    //Recovers ID
    const userId = this.getId(token);

    //Prepare object for the http update
    /*const  update: UserInterface = {
      id: userId!,
      firstName: firstname ? firstname : '',
      lastName: lastname ? lastname : '',
      nickName: nickname ? nickname : '',
      email: email ? email : '',
      a2f: a2f
    };*/

    const update: UserInterface = {
      id: userId!,
    };

    if (firstname) {
      update.firstName = firstname;
    }

    if (lastname) {
      update.lastName = lastname;
    }

    if (nickname) {
      update.nickName = nickname;
    }

    if (email) {
      update.email = email;
    }

    update.a2f = a2f;

    this.updateSubscription = this.http.put<UserInterface>(`${NESTJS_URL}/users`, update,
    {
      headers: new HttpHeaders().append('authorization', `Bearer ${token}`)
    }).subscribe(() => {
      this.router.navigateByUrl('profile');
    });

    return (this.updateSubscription);
  }

  // Get sanitazed informations about one user
  getUserInfo(userId: number) : Observable<UserSanitizeInterface> | null {
    const token = this.cookieService.getToken();

    if (!token) return (null);

    return this.http.get<UserSanitizeInterface>(`${NESTJS_URL}/users/${userId}`, {headers:
      new HttpHeaders().append('authorization', `Bearer ${token}`)})
      .pipe(catchError(this.handleError));
  }


  /* Friends Resquests */

  addFriends(targetId: number) {
    const token = this.cookieService.getToken();

    if (!token) return ;

    const userId = this.getId(token);

    return this.http.post(`${NESTJS_URL}/friends/add`, {
      user1: userId, user2: targetId
    }, {headers:
      new HttpHeaders().append('authorization', `Bearer ${token}`)}).pipe(catchError(this.handleError));
  }

  updateFriendsStatus(userId: number) {
    const token = this.cookieService.getToken();

    if (!token) return ;

    return this.http.patch(`${NESTJS_URL}/friends/update/${userId}`, null, {headers:
      new HttpHeaders().append('authorization', `Bearer ${token}`)}).pipe(catchError(this.handleError));
  }

  listFriends(approved: boolean): Observable<Friends[]> | undefined {
    const token = this.cookieService.getToken();

    if (!token) return ;

    //Setting request param, print all friends on false, print only approved friends on true
    const param = new HttpParams().set('approved', approved);

    return this.http.get<Friends[]>(`${NESTJS_URL}/friends/list/`,
    {headers: new HttpHeaders().append('authorization', `Bearer ${token}`),
    params: param}).pipe(catchError(this.handleError));
  }

  deleteFriends(friendId: number) {
    const token = this.cookieService.getToken();

    if (!token) return ;

    return this.http.delete(`${NESTJS_URL}/friends/delete/${friendId}`, {headers:
    new HttpHeaders().append('authorization', `Bearer ${token}`)}).pipe(catchError(this.handleError));
  }

/** Block Requests */

  blockUser(targetId: number): Observable<HttpResponse<Status>> | undefined {
    const token = this.cookieService.getToken();

    if (!token) return ;

    const userId = this.getId(token);

    return this.http.post<HttpResponse<Status>>(`${NESTJS_URL}/block/add`, {
      user1: userId, user2: targetId }, { headers: 
        new HttpHeaders().append('authorization', `Bearer ${token}`)}).pipe(catchError(this.handleError));
  }

  /** Register new User without 42 API */

  registerUser(userData: UserInterface): Observable<HttpResponse<Status>> | undefined {
    console.log(userData);
    return this.http.post<HttpResponse<Status>>('http://localhost:3000/auth/register', userData);
  }
}

