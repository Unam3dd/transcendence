import {Component, OnInit} from '@angular/core';
import {RequestsService} from "../services/requests.service";
import {Observable} from "rxjs";
import {UserInterface} from "../interfaces/user.interface";
import {Router} from "@angular/router";
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss']
})
export class GameMenuComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;
  client: WsClient = this.ws.getClient();
  selectedValue: string = '';

  constructor(private requestsService: RequestsService,
              private router: Router, private ws: WebsocketService, private modalService: NgbModal,) {}

  ngOnInit() {
    this.userData$ = this.requestsService.getLoggedUserInformation();
  }

  moveToGame(mode: string, size: string | null) {
    if (mode === 'remote')
    {
      this.findGame();
      this.router.navigate(['game/remote']);
    }
    else if (mode === 'tournament_remote')
    {
      if (!size)
        return ;
      this.findTournament(+size);
      this.router.navigate(['game/remote'], {queryParams: {mode: mode}});
    }
    else if (mode === 'tournament_local')
    {
      this.modalService.dismissAll();
      if (!size)
        return ;
      this.router.navigate(['game'], {queryParams: {mode: mode, size: size}});
    }
    else
      this.router.navigate(['game'], {queryParams: {mode: mode}});
  }

  findGame(): void {
    //this.ws.privateGame(this.client, "tata3"); // it was just a test to send a game invit to nickName tata3
    this.ws.enterLobby(this.client, 2);
  }
  
  findTournament(size: number): void {
    this.modalService.dismissAll();
    console.log("size: ", size);
    if (size < 3 || size > 8)
      size = 3;
    this.ws.enterLobby(this.client, size);
  }

  openModal(content: any):void {
    this.modalService.open(content);
  }
}
