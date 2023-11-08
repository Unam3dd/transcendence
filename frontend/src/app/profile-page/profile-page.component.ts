import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import { UserInterface } from '../interfaces/user.interface';
import {Router} from "@angular/router";
import { CookiesService } from '../services/cookies.service';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{
  constructor(private requestService: RequestsService,
              private cookieService: CookiesService,
              private router: Router,
              private modalService: NgbModal) {}

  userData$!: Observable<UserInterface> | null;

  // Get data of user has been logged from backend service (NestJS)
  ngOnInit(): void {
    this.userData$ = this.requestService.getLoggedUserInformation();
  }

  moveToUpdate() {
    this.router.navigateByUrl('profile/update');
  }

  Logout() {
    this.cookieService.removeCookie('authorization');
  }

  openModal(content: any) {
    this.modalService.open(content);
  }

  deleteUser() {
    this.requestService.deleteUser()?.subscribe();
    this.cookieService.removeCookie('authorization');
  }
}
