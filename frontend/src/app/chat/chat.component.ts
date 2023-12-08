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

  constructor (
    public  ws: WebsocketService, 
    private notif: NotificationsService,
    private formBuilder: FormBuilder,
  ) {}
    
  msg = this.formBuilder.group({
    content: ''
  });

  ngOnInit() {
    const client: WsClient = this.ws.getClient();

    this.ws.targetRecipient = null;
    this.ws.client_name = 'Main chat';

    client.on('getOldMsg', (data) => {
      if (this.ws.received_messages.length === 0) {

        if (!this.ws.targetRecipient) {
          for (let i = 0; i < data.length; i++) {
            if (this.IsMainChat(data[i]))
              this.ws.received_messages.push(data[i]);
        }
        }
        else {
          for (let i = 0; i < data.length; i++) {
            if (this.IsDM(data[i]))
              this.ws.received_messages.push(data[i]);
          }
        }
      }
      this.scrollToBottom();
    })

    client.on('newJoinChat', (msg) => {
      if (msg[0] != this.ws.getUserInformation()?.login)
        this.notif.info('Info', msg[1]);
    })

    client.on('newLeaving', (msg) => {
      this.notif.info('Info', msg);
    })

    client.on('newMessage', (msg) => {
      this.ws.received_messages.push(msg);
    })

    this.ws.sendHelloChat(client);

  }

  sendMessage() {
    
    if (!this.msg.value.content) return ;

    this.ws.sendMessage('message', this.msg.value.content);
    this.msg.reset();
    this.scrollToBottom();
  }

  IsBlocked(id: number) {
    const user = this.ws.BlockUserList.find((el) => el.user2 === id);
    return (user != null);
  }

  IsMainChat(msg: Message): Boolean {
    if (!this.IsBlocked(msg.author.id) && this.ws.targetRecipient === null && msg.recipient === null)
      return true;
    return false;
  }

  IsDM(msg: Message): Boolean {
    if (!this.IsBlocked(msg.author.id) && this.ws.targetRecipient && msg.recipient
    && (msg.author.login === this.ws.getUserInformation()?.login
    || msg.author.login === this.ws.targetRecipient?.login)
    && (msg.recipient.login === this.ws.getUserInformation()?.login
    || msg.recipient.login === this.ws.targetRecipient?.login))
      return true;
    return false;
  }

  scrollToBottom() {
    setTimeout(() => {  
      let block: HTMLElement | null = document.getElementById('scrollable');
      if (block)
        block.scrollTop = block.scrollHeight;
     }, 150);
  }

  ngOnDestroy()
  {
    const client: WsClient = this.ws.getClient();

    client.off('newJoinChat');
    client.off('newLeaving');
    client.off('newMessage');
  }
}
