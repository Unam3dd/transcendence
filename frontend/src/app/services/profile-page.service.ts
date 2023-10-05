import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
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
}
