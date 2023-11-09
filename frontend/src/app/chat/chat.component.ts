import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import { NotificationsService } from 'angular2-notifications';
import { FormBuilder } from '@angular/forms';
import { Message } from '../interfaces/user.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor (private ws: WebsocketService, private notif: NotificationsService, private formBuilder: FormBuilder) {}

  received_messages: Message[] = [];
  msg = this.formBuilder.group({
    content: ''
  });

  ngOnInit() {
    const client: WsClient = this.ws.getClient();

    client.on('newJoinChat', (msg) => {
      this.notif.info('Info', msg);
    })

    client.on('newDepart', (msg) => {
      this.notif.info('Info', msg);
    })

    client.on('newMessage', (msg) => {
      this.received_messages.push(msg);
    })

    this.ws.sendHelloChat(client);
  }

  sendMessage() {
    this.ws.sendMessage('message', this.msg.value.content);
    this.msg.reset();
  }
}
