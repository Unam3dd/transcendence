import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpResponse, HttpStatusCode } from "@angular/common/http";
import {Observable, catchError, throwError, Subscription } from "rxjs";
import {CookiesService} from "./cookies.service";
import {JwtService} from "./jwt.service";
import { NESTJS_URL } from '../env';
import { UserInterface, UserSanitizeInterface } from '../interfaces/user.interface'
import { JWT_PAYLOAD } from './jwt.const';
import { Friends } from '../interfaces/friends.interface';
import { BlockedUser } from '../interfaces/user.interface';
import { GameResult, PlayerResult } from '../interfaces/game.interface';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  //Used for updateUserDatas
  private updateSubscription: Subscription | undefined;

  constructor(private http: HttpClient,
              private readonly cookieService: CookiesService,
              private jwtService: JwtService,
              ) {}

  //Handle requests errors
  private handleError(error: HttpErrorResponse){
    return throwError(() => new Error (`Error response ${error.status}`));
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
      console.log('Unexpected error:', error);
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

    const { sub, login } = JSON.parse(atob(token.split('.')[1]));

    if (newNickname.trim() === '') {
        return this.updateUserHomeData(login, email);
    } else {
      const updateData = {id: sub, nickName: newNickname, email: email};
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
    const  update: Partial<UserInterface> = { id: userId! };

    if (firstname) update.firstName = firstname;
    if (lastname) update.lastName = lastname;
    if (nickname) update.nickName = nickname;
    if (email) update.email = email;
    update.a2f = a2f;

    return (this.http.put<UserInterface>(`${NESTJS_URL}/users`, update,{headers: new HttpHeaders().append('authorization', `Bearer ${token}`)}));
  }

  uploadUserImage(img: File) {

    //Recovers Cookie and gives authorization
    const token = this.cookieService.getToken();

    if (!token) return ;

    const formData = new FormData();

    formData.append('file', img);

    return this.http.post(`${NESTJS_URL}/upload`, formData,
        {
          headers: new HttpHeaders().append('authorization', `Bearer ${token}`)
        });
  }

  deleteUser(): Observable<UserInterface> | null {
    const JWT_TOKEN = this.cookieService.getToken();

    if (!JWT_TOKEN) return (null);

    return (this.http.delete<UserInterface>(`${NESTJS_URL}/users`, {
      headers: new HttpHeaders().append('authorization', `Bearer ${JWT_TOKEN}`) }).pipe(catchError(this.handleError)));
  }

  // Get sanitazed informations about one user
  getUserInfo(userId: number) : Observable<UserSanitizeInterface> | null {
    const token = this.cookieService.getToken();

    if (!token) return (null);

    return this.http.get<UserSanitizeInterface>(`${NESTJS_URL}/users/${userId}`, {headers:
      new HttpHeaders().append('authorization', `Bearer ${token}`)})
      .pipe(catchError(this.handleError));
  }


  /** Friends Resquests **/

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

  blockUser(targetId: number): Observable<HttpResponse<HttpStatusCode>> | undefined {
    const token = this.cookieService.getToken();

    if (!token) return ;

    const userId = this.getId(token);

    return this.http.post<HttpResponse<HttpStatusCode>>(`${NESTJS_URL}/block/add`, {
      user1: userId, user2: targetId }, { headers:
        new HttpHeaders().append('authorization', `Bearer ${token}`)}).pipe(catchError(this.handleError));
  }

  listBlockedUser(): Observable<BlockedUser[]> | null {
    const token = this.cookieService.getToken();

    if (!token) return (null);

    return (this.http.get<BlockedUser[]>(`${NESTJS_URL}/block/list`, { headers: new HttpHeaders().append('authorization', `Bearer ${token}`)})).pipe(catchError(this.handleError));
  }

  /** Register new User without 42 API */

  registerUser(userData: UserInterface) {
    return this.http.post(`${NESTJS_URL}/auth/register`, userData, { observe: 'response', responseType: 'text'}).pipe(catchError(this.handleError));
  }

  loginUser(login: string, password: string) {
    return this.http.post(`${NESTJS_URL}/auth/login`, { login: login, password: password}, { observe: 'response', responseType: 'json'}).pipe(catchError(this.handleError));
  }

  sendA2fToken(token: string | null | undefined): Observable<HttpResponse<Object>> {
    const login: string | null = this.cookieService.getCookie('tmp_name');

    return this.http.post(`${NESTJS_URL}/a2f/verify`, { token: token }, { headers: new HttpHeaders().append('tmp_name', `${login}`), observe: 'response'});
  }

  /** Game Requests */

  addGameResult(gameResult: PlayerResult)
  {
    const token = this.cookieService.getToken();

    if (!token) return ;

    return this.http.post<HttpResponse<HttpStatusCode>>(`${NESTJS_URL}/game/add`, gameResult, { headers:
      new HttpHeaders().append('authorization', `Bearer ${token}`)}).pipe(catchError(this.handleError));
  }

  listGame(userId: number)
  {
    const token = this.cookieService.getToken();

    if (!token) return ;

    return this.http.get<GameResult[]>(`${NESTJS_URL}/game/list/${userId}`, {headers:
      new HttpHeaders().append('authorization', `Bearer ${token}`)}).pipe(catchError(this.handleError));
  }
}

