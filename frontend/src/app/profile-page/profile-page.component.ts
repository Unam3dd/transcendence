import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import { UserInterface } from '../interfaces/user.interface';
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;
  constructor(private requestService: RequestsService,
              private router: Router) {}


  // Get data of user has been logged from backend service (NestJS)
  ngOnInit(): void {
    this.userData$ = this.requestService.getLoggedUserInformation();
  }

  moveToUpdate() {
    this.router.navigateByUrl('profile/update');
  }
}
