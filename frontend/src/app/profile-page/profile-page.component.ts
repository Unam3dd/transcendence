import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import { CookiesService } from '../services/cookies.service';


@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  //Variables des données à récupérer pour la bdd
  userData$!: Observable<any>;
  constructor(private profilePageService: RequestsService, private readonly cookieService: CookiesService) {}


  //Récupération des données à partir du backend pour pour les afficher en front
  ngOnInit(): void {
    this.userData$ = this.profilePageService.getData();
  }
}
