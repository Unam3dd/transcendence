import { Component } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { ClientInfoInterface, UserSanitizeInterface } from '../interfaces/user.interface';

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

    client.on('listClient', (clients: ClientInfoInterface[]) => {
      this.listClients = clients.filter(client => client.login !== this.ws.getUserInformation()?.login);
    })
  }

  onChannelClicked(recipient?: ClientInfoInterface | null) {

    console.log(this.listClients);
    console.log(recipient);

    if (!recipient) {
      //if not on general already, call for general conversation
      console.log("general is called");
      this.ws.targetRecipient = null;
    } else {
      //if not on recipient already, call for recipient conversation
      this.ws.targetRecipient = recipient;
    }

  }
}
