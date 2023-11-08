import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientInfo } from 'src/interfaces/user.interfaces';
import { UserSanitize } from 'src/interfaces/user.interfaces';

@WebSocketGateway(3001, { namespace: 'events', cors: true })
export class EventsGateway {
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
    this.server.emit('newMessage', message);
  }

  @SubscribeMessage('newJoinChat')
  JoinChat(@MessageBody() body: string, @ConnectedSocket() client: Socket) {
    this.server.emit('newJoinChat', body);
    this.ListClient(client);
  }

  //Detect clients disconnection
  handleDisconnect(@ConnectedSocket() client: Socket) {

    for (const el of this.clientList) {
      if (el.client.id === client.id) {
        el.client.disconnect(true);
        this.server.emit('newDepart', `${el.nickName} (${el.login}) has left transcendence`);
        const index = this.clientList.indexOf(el);
        this.clientList.splice(index, 1);
        break ;
      }
    }
  }

  @SubscribeMessage('listClient')
  ListClient(@ConnectedSocket() client: Socket) {
    let loginArray: UserSanitize[] = [];

    this.clientList.forEach((el: ClientInfo) => {
      
      const usanitize: UserSanitize = {
        id: el.id,
        login: el.login,
        nickName: el.nickName,
        avatar: el.avatar
      };

      loginArray.push(usanitize);
    });
    client.emit('listClient', loginArray);
  }
}
