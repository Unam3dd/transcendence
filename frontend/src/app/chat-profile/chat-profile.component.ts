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

  constructor (public ws: WebsocketService) {}

  ngOnInit() {
    const client = this.ws.getClient();

    client.on('listClient', (clients: ClientInfoInterface[]) => {
      this.listClients = clients.filter(client => client.login !== this.ws.getUserInformation()?.login);
    })
  }

  onChannelClicked(recipient?: ClientInfoInterface | null) {

    if (!recipient) {
      //if not on general already, call for general conversation
      console.log("general is called");
      this.ws.targetRecipient = null;
      this.ws.client_name = 'general';
    } else {
      //if not on recipient already, call for recipient conversation
      this.ws.targetRecipient = recipient;
      this.ws.client_name = `${recipient.login} (${recipient.nickName})`;
    }
  }
}
