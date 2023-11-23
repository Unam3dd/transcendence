import { Component } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { BlockedUser, ClientInfoInterface } from '../interfaces/user.interface';
import { RequestsService } from '../services/requests.service';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.component.html',
  styleUrls: ['./chat-profile.component.scss']
})
export class ChatProfileComponent {

  listClients: ClientInfoInterface[] = [];

  constructor (public ws: WebsocketService, public req: RequestsService) {}

  ngOnInit() {
    const client = this.ws.getClient();

    client.on('listClient', (clients: ClientInfoInterface[]) => {
      this.listClients = clients.filter(client => client.login !== this.ws.getUserInformation()?.login)

      for (let user of this.ws.BlockUserList)
        this.listClients = this.listClients.filter(client => client.id !== user.user2);
    })

    client.on('getListBlocked', (blockedUsers: BlockedUser[]) => {
      this.ws.BlockUserList = blockedUsers;
      for (let user of this.ws.BlockUserList)
        this.listClients = this.listClients.filter(client => client.id !== user.user2);
    })

    client.emit('listBlocked');
  }

  onChannelClicked(recipient?: ClientInfoInterface | null) {

    if (!recipient) {
      //if not on general already, call for general conversation
      this.ws.targetRecipient = null;
      this.ws.client_name = 'general';

      for (let user of this.ws.BlockUserList) {
        this.listClients = this.listClients.filter(client => client.id !== user.user2);
        console.log(this.listClients);
      }

    } else {
      
      for (let user of this.ws.BlockUserList)
        this.listClients = this.listClients.filter(client => client.id !== user.user2);
      //if not on recipient already, call for recipient conversation
      this.ws.targetRecipient = recipient;
      this.ws.client_name = `${recipient.login} (${recipient.nickName})`;
    }
  }

  blockUser(id: number) {
    this.req.blockUser(id)?.subscribe(() => {
      
      const client = this.ws.getClient();

      client.emit('listBlocked');
    })
  }
}
