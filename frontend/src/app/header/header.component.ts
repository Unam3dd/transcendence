import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {UserInterface} from "../interfaces/user.interface";
import {RequestsService} from "../services/requests.service";
import {CookiesService} from "../services/cookies.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;

  constructor(private router: Router,
              private requestsService: RequestsService,
              private cookieService: CookiesService) {}

  ngOnInit() {
    this.userData$ = this.requestsService.getLoggedUserInformation();
  }

  Logout() {
    this.cookieService.removeCookie('authorization');
  }

  moveToHome() {
    this.router.navigateByUrl('home');
  }

  moveToProfile() {
    this.router.navigateByUrl('profile');
  }

  moveToGame() {
    this.router.navigateByUrl('game-menu');
  }

  moveToChat() {
    this.router.navigateByUrl('chat');
  }
}
