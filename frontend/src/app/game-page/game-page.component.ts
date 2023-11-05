import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnInit{

  client: WsClient = this.ws.getClient();
  display: boolean = false;

  constructor(private ws: WebsocketService) {}
  
  ngOnInit(): void {

    this.client.on('gameMessage', (data) => {
      console.log(data);
    })

    this.client.on('display', () => {
      this.display = true;
    })

    this.client.on('endGame', () => {
      console.log("Game has finished");
      this.display = false;
    });
  } 

  findGame(): void {
    this.ws.enterLobby(this.client, 2);
  }
  
  findTournament(): void {
    this.ws.enterLobby(this.client, 3);
  }

  endGame(button: string): void {
    this.ws.endGame(this.client, button);
  }

}
