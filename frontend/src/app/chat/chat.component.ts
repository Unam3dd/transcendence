import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor (private ws: WebsocketService, private notif: NotificationsService) {}

  ngOnInit() {
    const client: WsClient = this.ws.getClient();

    client.on('newJoinChat', (msg) => {
      this.notif.info('New Arrival !!!', msg);
    })

    client.emit('message', 'hello chat !');

    this.ws.sendHelloChat(client);
  }
}
