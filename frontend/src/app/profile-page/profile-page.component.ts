import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import {MatDialog} from "@angular/material/dialog";
import {UpdateProfileComponent} from "../update-profile/update-profile.component";
import { UserInterface } from '../interfaces/user.interface';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;
  constructor(private requestService: RequestsService, public dialog: MatDialog) {}


  // Get data of user has been logged from backend service (NestJS)
  ngOnInit(): void {
    this.userData$ = this.requestService.getLoggedUserInformation();
  }

  openDialog() {
    const dialogRef = this.dialog.open(UpdateProfileComponent);

    dialogRef.afterClosed().subscribe(() => {
      window.location.reload();
    });
  }
}
