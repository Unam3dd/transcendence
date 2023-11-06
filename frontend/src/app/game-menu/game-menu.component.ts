import {Component, OnInit} from '@angular/core';
import {RequestsService} from "../services/requests.service";
import {Observable} from "rxjs";
import {UserInterface} from "../interfaces/user.interface";
import {Router} from "@angular/router";

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss']
})
export class GameMenuComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;

  constructor(private requestsService: RequestsService,
              private router: Router) {}

  ngOnInit() {
    this.userData$ = this.requestsService.getLoggedUserInformation();
  }

  moveToGame() {
    this.router.navigateByUrl('game');
  }
}
