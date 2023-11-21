import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import { UserInterface } from '../interfaces/user.interface';
import { CookiesService } from '../services/cookies.service';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormControl} from "@angular/forms";
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{
  constructor(private requestService: RequestsService,
              private cookieService: CookiesService,
              private modalService: NgbModal,
              private notif: NotificationsService) {}

  userData$!: Observable<UserInterface> | null;
  qrcodeURL = '';
  firstname = new FormControl('');
  lastname = new FormControl('');
  nickname = new FormControl('');
  email = new FormControl('');
  a2f!: FormControl<boolean | null>;

  // Get data of user has been logged from backend service (NestJS)
  ngOnInit(): void {
    this.userData$ = this.requestService.getLoggedUserInformation();

    this.userData$?.subscribe((userData: UserInterface) => {
      if (userData && userData.a2f !== undefined && userData.a2f !== null) {
        const a2fValue: boolean = userData.a2f;

        this.a2f = new FormControl(a2fValue);
      }
    });
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

  //update function for update the profile
  async updateDatas() {
    const firstname: string = this.firstname.value as string;
    const lastname: string = this.lastname.value as string;
    const nickname: string = this.nickname.value as string;
    const email: string = this.email.value as string;
    const a2f: boolean = this.a2f.value as boolean;

    const observable = await this.requestService.updateUserDatas(firstname, lastname, nickname, email, a2f)

    observable?.subscribe(async (data) => {
      this.notif.success('Profile Updated successfully !', 'Your profile has been updated');
      const { token, qrcode } = JSON.parse(JSON.stringify(data));
      this.qrcodeURL = qrcode;
      this.cookieService.removeOnlyCookie('authorization');
      this.cookieService.setCookie('authorization', encodeURI(`Bearer ${token}`));
    })
  }
}
