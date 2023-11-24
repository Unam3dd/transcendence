import {Component, OnInit} from '@angular/core';
import {RequestsService} from "../services/requests.service";
import {Observable} from "rxjs";
import {UserInterface} from "../interfaces/user.interface";
import {Router} from "@angular/router";
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { HttpClient } from '@angular/common/http';
import { OnlineState } from '../enum/status.enum';

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
              private router: Router, private ws: WebsocketService, private modalService: NgbModal,private http: HttpClient) {}

  ngOnInit() {
    this.userData$ = this.requestsService.getLoggedUserInformation();
  }

  moveToGame(mode: string, size: string | null) {
    if (mode === 'remote')
    {
     // this.ws.changeStatus(this.client, OnlineState.ingame);
      this.findGame();
      this.router.navigate(['game/remote']);
    }
    else if (mode === 'tournament_local')
    {
      this.modalService.dismissAll();
      if (!size)
        return ;
      this.ws.changeStatus(this.client, OnlineState.ingame);
      this.router.navigate(['game'], {queryParams: {mode: mode, size: size}});
    }
    else
    {
      this.ws.changeStatus(this.client, OnlineState.ingame);
      this.router.navigate(['game'], {queryParams: {mode: mode}});
    }
  }

  findGame(): void {
    //this.ws.privateGame(this.client, "toto3"); // it was just a test to send a game invit to nickName toto3
    this.ws.enterLobby(this.client, 2);
  }

  openModal(content: any):void {
    this.modalService.open(content);
  }
}
