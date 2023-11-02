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

  player1: string = '';
  player2: string = '';

  constructor(private ws: WebsocketService) {}
  
  ngOnInit(): void {

    this.client.on('newPlayer', (data) => {
      console.log(data);
    })

    this.client.on('matchFound', (data) => {
      console.log('match found vs', data.login)
    });

    this.client.on('display', () => {
      this.display = true;
    })

    this.client.on('endGame', () => {
      this.display = false;
    });
  } 

  findGame(): void {
    this.ws.enterLobby(this.client);
  }
  
  endGame(button: string): void {
    this.ws.endGame(this.client, button);
  }

}
