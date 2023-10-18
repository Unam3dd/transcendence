import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor (private ws: WebsocketService) {}

  ngOnInit() {
    const client: WsClient = this.ws.getClient();

    client.emit('message', 'hello chat !');
  }
}
