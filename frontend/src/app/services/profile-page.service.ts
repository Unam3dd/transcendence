import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProfilePageService {

  private backUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  //Requêtes http

  //Récupère les données du user en fonction de l'ID
  getData(userId: number): Observable<string> {
    const url: string = `${this.backUrl}/${userId}`;
    return this.http.get<string>(url);
  }

  //Permet de modifier le nickname de l'utilisateur
  updateUserNickname(userId: number, newNickname: string): Observable<any>{
    const url: string = `${this.backUrl}/${userId}`;
    const updateNickname = {nickName: newNickname};

    return this.http.put(url, updateNickname);
  }
}
