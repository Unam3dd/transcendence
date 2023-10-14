import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import { CookiesService } from '../services/cookies.service';
import {MatDialog} from "@angular/material/dialog";
import {UpdateProfileComponent} from "../update-profile/update-profile.component";


@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  //Variables des données à récupérer pour la bdd
  userData$!: Observable<any>;
  constructor(private requestService: RequestsService,
              private readonly cookieService: CookiesService,
              public dialog: MatDialog) {}


  //Récupération des données à partir du backend pour pour les afficher en front
  ngOnInit(): void {
    this.userData$ = this.requestService.getUserData();
  }

  openDialog() {
    const dialogRef = this.dialog.open(UpdateProfileComponent);

    dialogRef.afterClosed().subscribe(() => {
      window.location.reload();
    });
  }
}
