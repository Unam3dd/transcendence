import {Component, OnInit} from '@angular/core';
import {ProfilePageService} from "../services/profile-page.service";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  //Variables des données à récupérer pour la bdd
  userId: number = 1;
  userData$!: Observable<any>;

  constructor(private profilePageService: ProfilePageService) {}

  //Récupération des données à partir du backend pour pour les afficher en front
  ngOnInit(): void {
    this.userData$ = this.profilePageService.getData(this.userId);
  }
}
