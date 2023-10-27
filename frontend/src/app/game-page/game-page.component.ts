import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import { UserInterface, UserSanitizeInterface } from '../interfaces/user.interface';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnInit{

  client: WsClient = this.ws.getClient();

  constructor(private ws: WebsocketService) {}
  
  ngOnInit(): void {
    console.log('game')

    this.client.on('matchFound', (data) => {
      console.log('match found vs', data.login)
    });
  }

  search_game(): void {
    this.ws.searchGame(this.client);
    console.log('searching for opponent'); 
  }

}
