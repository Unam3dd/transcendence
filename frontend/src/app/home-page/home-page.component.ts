import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {RequestsService} from "../services/requests.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  userData$!: Observable<any>;
  nickname: string = '';

  constructor(private router: Router,
              private profilePageService: RequestsService) {}

  ngOnInit() {
    this.userData$ = this.profilePageService.getData();
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
    this.profilePageService.updateUserNickname(this.nickname).subscribe(() => {
      window.location.reload();
    });
  }
}
