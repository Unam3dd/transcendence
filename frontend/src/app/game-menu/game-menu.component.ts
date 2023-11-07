import {Component, OnInit} from '@angular/core';
import {RequestsService} from "../services/requests.service";
import {Observable} from "rxjs";
import {UserInterface} from "../interfaces/user.interface";
import {Router} from "@angular/router";
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss']
})
export class GameMenuComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;
  client: WsClient = this.ws.getClient();

  constructor(private requestsService: RequestsService,
              private router: Router, private ws: WebsocketService) {}

  ngOnInit() {
    this.userData$ = this.requestsService.getLoggedUserInformation();
  }

  moveToGame(mode: string) {
    if (mode === 'remote')
      this.findGame();
    if (mode === 'tournament_remote')
      this.findTournament();
    this.router.navigate(['game'], {queryParams: {mode: mode}});
  }

  findGame(): void {
    this.ws.enterLobby(this.client, 2);
  }
  
  findTournament(): void {
    this.ws.enterLobby(this.client, 4);
  }
}
