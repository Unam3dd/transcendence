import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { CookiesService } from './cookies.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilePageService {

  private backUrl: string = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  //Récupère les données du user en fonction de l'ID
  getData(userId: number): Observable<string> {
    const url = `${this.backUrl}/${userId}`;
    return this.http.get<string>(url);
  }
}
