import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor (private ws: WebsocketService) {}

  ngOnInit() {
    console.log('hello chat !');
    const client: Socket<DefaultEventsMap, DefaultEventsMap> = this.ws.getClient();

    client.emit('message', 'hello chat !');
  }
}
