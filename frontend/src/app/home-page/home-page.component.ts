import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {RequestsService} from "../services/requests.service";
import {Observable} from "rxjs";
import {FormControl, Validators} from "@angular/forms";
import { UserInterface } from '../interfaces/user.interface';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  userData$!: Observable<UserInterface> | null;
  nickname = new FormControl('');
  email = new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3}$/)]);

  constructor(private router: Router,
              private requestsService: RequestsService,
              private notif: NotificationsService) {}

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
  updateNickname() {
    this.notif.info('Information', 'You are now register with 42API !');
    const newNickname: string = this.nickname.value as string;
    const newEmail: string = this.email.value as string;
    this.requestsService.updateUserHomeData(newNickname, newEmail)?.subscribe((data) => {

      this.notif.success('Success', 'Your profile has been updated !');

      const { token } = JSON.parse(JSON.stringify(data));

      document.cookie = `authorization=${encodeURI(`Bearer ${token}`)}`;

      window.location.reload();
    }, () => {
      this.notif.error('Error', 'Nickname or email is already taken please choose another nickname or email !');
    });
  }
}
