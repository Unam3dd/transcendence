import { Component } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { BlockedUser, ClientInfoInterface } from '../interfaces/user.interface';
import { RequestsService } from '../services/requests.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.component.html',
  styleUrls: ['./chat-profile.component.scss']
})
export class ChatProfileComponent {

  listClients: ClientInfoInterface[] = [];

  constructor (public ws: WebsocketService, public req: RequestsService, private readonly router: Router) {}

  ngOnInit() {
    const client = this.ws.getClient();

    this.refreshChat();

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
      this.ws.client_name = 'Main chat';
      
      for (let user of this.ws.BlockUserList) {
        this.listClients = this.listClients.filter(client => client.id !== user.user2);
      }
      
    } else {
      for (let user of this.ws.BlockUserList)
        this.listClients = this.listClients.filter(client => client.id !== user.user2);
      //if not on recipient already, call for recipient conversation
      this.ws.targetRecipient = recipient;
      this.ws.client_name = `${recipient.login} (${recipient.nickName})`;
    }
    this.refreshChat();
  }

  blockUser(id: number) {
    this.req.blockUser(id)?.subscribe(() => {
      
      const client = this.ws.getClient();

      client.emit('listBlocked');
      this.refreshChat();
    })
  }

  inviteUser(nickName: string) {
    const client = this.ws.getClient();

    this.ws.privateGame(client, nickName);
    this.router.navigate(['game/remote']);
  }

  visitUser(id: number)
  {
    const page: string = '/user/' + id;
    this.router.navigate([page]);
  }

  refreshChat() {
    this.ws.received_messages = [];
    this.ws.getOldMessages();
  }

  truncateText(nickname :string, login: string, limit: number): string {
    let str1 = nickname.length > limit ? nickname.substring(0, limit) + '...' : nickname;
    let str2 = login.length > limit ? login.substring(0, limit - 2) + '...' : login;
    return (str1 + ` (${str2})`)
  }

  ngOnDestroy()
  {
    const client = this.ws.getClient();
    client.off('listClient');
    client.off('getListBlocked');
  }
}
