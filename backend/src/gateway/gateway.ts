import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientInfo, ListUserSanitizeInterface } from 'src/interfaces/user.interfaces';
import { BlockService } from 'src/modules/block/block.service';
import { BlockedUser } from 'src/interfaces/user.interfaces';

@WebSocketGateway(3001, { namespace: 'events', cors: true })
export class EventsGateway {

  constructor (private block: BlockService) {}

  //To get an instance of the server, so we can send message to every clients of the server and more
  @WebSocketServer()
  server: Server;

  clientList: ClientInfo[] = [];

  //Detect clients connections
  handleConnection(client: Socket) {
    console.log('New user connected');

    // send message to the client that listen a 'welcome' event
    client.emit('welcome', 'Welcome to the WebSocket server!');

    // send message to all clients of the server on 'reponse' event using the server instance
    this.server.emit('response', 'A new client just connect');
  }

  @SubscribeMessage('join')
  newArrival(@MessageBody() msg: string, @ConnectedSocket() client: Socket) {
    try {
      const { id, login } = JSON.parse(msg);

      const found = this.clientList.find((el) => el.id === id);

      if (!found) {
        this.clientList.push({
          ...JSON.parse(msg),
          client
        });
      }

      this.server.emit('newArrival', `${login} has join the transcendence !`);
    } catch (e) {
      console.error(e);
    }
  }

  // Define actions when receiving an event, 'message' event in this case
  @SubscribeMessage('message')
  receiveNewMessage(
    @MessageBody() message: string) {
    console.log(message);
    this.server.emit('newMessage', message);
  }

  @SubscribeMessage('newJoinChat')
  JoinChat(@MessageBody() body: string) {
    this.server.emit('newJoinChat', body);
    this.ListClient();
  }

  //Detect clients disconnection
  handleDisconnect(@ConnectedSocket() client: Socket) {

    console.log('New user just disconnected !');

    for (const el of this.clientList) {
      if (el.client.id === client.id) {
        el.client.disconnect();
        this.server.emit('newDepart', `${el.nickName} (${el.login}) has left transcendence`);
        const index = this.clientList.indexOf(el);
        this.clientList.splice(index, 1);
        this.ListClient();
        return ;
      }
    }
  }

  @SubscribeMessage('listClient')
  ListClient() {
    let loginArray: ListUserSanitizeInterface[] = [];

    this.clientList.forEach((el: ClientInfo) => {
      
      const usanitize: ListUserSanitizeInterface = {
        id: el.id,
        login: el.login,
        nickName: el.nickName,
        avatar: el.avatar,
        clientID: el.client.id
      };

      loginArray.push(usanitize);
    });
    this.server.emit('listClient', loginArray);
  }

  @SubscribeMessage('listBlocked')
  async ListBlocked(@ConnectedSocket() client: Socket) {

    const targetClient = this.clientList.find((el) => el.client.id === client.id);

    const blockedList = await this.block.listBlock(targetClient.id);

    client.emit('getListBlocked', <BlockedUser[]>(blockedList));
  }
}
