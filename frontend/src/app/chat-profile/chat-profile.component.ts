import { Component } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { ClientInfoInterface } from '../interfaces/user.interface';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.component.html',
  styleUrls: ['./chat-profile.component.scss']
})
export class ChatProfileComponent {

  listClients: ClientInfoInterface[] = [];

  constructor (private ws: WebsocketService) {}

  ngOnInit() {

    const client = this.ws.getClient();

    client.on('listClient', (clients) => {
      this.listClients = clients;
    })
  }

}
