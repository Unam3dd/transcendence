import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import { CookiesService } from '../services/cookies.service';
import { UserInterface } from '../interfaces/user.interface';


@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;
  constructor(private profilePageService: RequestsService, private readonly cookieService: CookiesService) {}


  // Get data of user has been logged from backend service (NestJS)
  ngOnInit(): void {
    this.userData$ = this.profilePageService.getLoggedUserInformation();
  }
}
