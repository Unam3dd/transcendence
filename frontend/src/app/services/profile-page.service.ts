import { Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, switchMap} from "rxjs";
import { CookiesService } from './cookies.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilePageService {

  private backUrl: string = 'http://localhost:3000/users';

  constructor(private http: HttpClient, private readonly cookieService: CookiesService) {}

  //Récupère les données du user en fonction de l'ID
  getData(userId: number): Observable<string> {
    const [type, token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];
    const hdr = new HttpHeaders().append('authorization', `${type} ${token}`);
    const url = `${this.backUrl}/${userId}`;
    return this.http.get<string>(url, { headers: hdr });
  }

  //Permet de modifier le nickname de l'utilisateur
  updateUserNickname(userId: number, newNickname: string): Observable<any>{
    const url: string = `${this.backUrl}`;
    if (newNickname.trim() === '') {              //Si newNickname est vide
      return this.getData(userId).pipe(           //Fait appel à getData pour avoir le login
        switchMap((data: any) => {         //switchMap pour prendre en conpte la récupération du login dans un nouvel observable
          const loginValue: string = data.login;
          return this.updateUserNickname(userId, loginValue); //Récursion avec la valeur du login
        })
      );
    } else {
      const updateNickname = {nickName: newNickname};
      return this.http.put(url, updateNickname);
    }
  }
}
