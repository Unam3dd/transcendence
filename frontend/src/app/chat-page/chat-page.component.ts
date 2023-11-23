import { Component } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { ClientInfoInterface } from '../interfaces/user.interface';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent /*implements OnInit*/ {

  listClients: ClientInfoInterface[] = [];

  constructor (private ws: WebsocketService) {}

  ngOnInit() {

    const client = this.ws.getClient();

    client.on('listClient', (clients) => {
      this.listClients = clients;
    })
  }
}
