import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {RequestsService} from "../services/requests.service";
import {Observable} from "rxjs";
import {FormControl, Validators} from "@angular/forms";
import { UserInterface } from '../interfaces/user.interface';
import { NotificationsService } from 'angular2-notifications';
import { TimerService } from '../services/timer.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  userData$!: Observable<UserInterface> | null;
  nickname = new FormControl('');
  count = 0;
  email = new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/)]);

  constructor(private router: Router,
              private requestsService: RequestsService,
              private notif: NotificationsService,
              private timer: TimerService) {}

  ngOnInit() {
    this.userData$ = this.requestsService.getLoggedUserInformation();
  }

  // Show an error if email input has been mal formatted or bad !
  getEmptyErrorMessage() {
    if (this.email.hasError('required')) {
      return 'Please enter a value';
    }
    return this.email.hasError('pattern') ? 'Not a valid email': '';
  }

  // Move to Profile page
  moveToProfile() {
    this.router.navigateByUrl('profile');
  }

  // Move to Game page
  moveToGame() {
    this.router.navigateByUrl('game-menu');
  }

  // Move to Chat page
  moveToChat() {
    this.router.navigateByUrl('chat');
  }

  // Update nickName of user and reload the page
  async updateNickname() {
    await this.timer.sleep(1000);
    const newNickname: string = this.nickname.value as string;
    const newEmail: string = this.email.value as string;
    this.requestsService.updateUserHomeData(newNickname, newEmail)?.subscribe(async (data) => {

      this.notif.success('Success', 'Your profile has been updated !');
      await this.timer.sleep(3000);

      const { token } = JSON.parse(JSON.stringify(data));

      document.cookie = `authorization=${encodeURI(`Bearer ${token}`)}`;

      window.location.reload();
    }, () => {
      this.notif.error('Error', 'Nickname or email already taken ! Please, choose another nickname or email.');
    });
  }
}
