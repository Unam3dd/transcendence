import {Component, OnInit} from '@angular/core';
import {ProfilePageService} from "../services/profile-page.service";
<<<<<<< HEAD
import {Observable} from "rxjs";
=======
import { CookiesService } from '../services/cookies.service';
>>>>>>> frontend

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  //Variables des données à récupérer pour la bdd
  userId: number = 1;
  userData$!: Observable<any>;

<<<<<<< HEAD
  //Constructeur indispensable pour injecter le service
  constructor(private profilePageService: ProfilePageService,) {}
=======
  constructor(private profilePageService: ProfilePageService, private readonly cookieService: CookiesService) {}
>>>>>>> frontend

  //Récupération des données à partir du backend pour pour les afficher en front
  ngOnInit(): void {
<<<<<<< HEAD
    this.userData$ = this.profilePageService.getData(this.userId);
=======
    console.log(this.cookieService.getCookie('authorization'));
    this.profilePageService.getData(this.userId).subscribe((data: any) => {
      this.firstName = data.firstName;
      this.lastName = data.lastName;
    });
>>>>>>> frontend
  }
}
