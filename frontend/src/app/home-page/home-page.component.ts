import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProfilePageService} from "../services/profile-page.service";
import {Observable} from "rxjs";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  userId: number = 1;
  userData$!: Observable<any>;
  nickname: string = '';

  constructor(private router: Router,
              private profilePageService: ProfilePageService) {}

  ngOnInit() {
    this.userData$ = this.profilePageService.getData(this.userId);
  }

  //Change pour le template de profile
  moveToProfile() {
    this.router.navigateByUrl('profile');
  }

  //Change pour le template de Game
  moveToGame() {
    this.router.navigateByUrl('game');
  }

  //Update du nickname de l'utilisateur puis reload la page
  updateNickname() {
    this.profilePageService.updateUserNickname(this.userId, this.nickname).subscribe(() => {
      window.location.reload();
    });
  }
}
