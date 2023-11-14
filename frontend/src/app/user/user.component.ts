import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserSanitizeInterface } from '../interfaces/user.interface';
import { RequestsService } from '../services/requests.service';
import { GameResult } from '../interfaces/game.interface';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  user = {} as UserSanitizeInterface;
  gameHistory: GameResult[] = [];

  constructor(private readonly route: ActivatedRoute,
    private readonly requestServices: RequestsService) {}

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const userIdFromRoute = Number(routeParams.get('userId'));

    this.requestServices.getUserInfo(userIdFromRoute)?.subscribe((user) => {
      this.user = user;

      this.requestServices.listGame(userIdFromRoute)?.subscribe((games) => {
        this.gameHistory = games;
      });
    });
  }
}