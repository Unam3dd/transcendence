import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NotificationService } from '../services/notifications.service';
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor (private ws: WebsocketService, private notificationService: NotificationService) {}

  ngOnInit() {
    const client: WsClient = this.ws.getClient();

    client.on('newJoinChat', (msg) => {
      this.notificationService.basic_notification(msg);
    })

    client.emit('message', 'hello chat !');

    this.ws.sendHelloChat(client);
  }
}
