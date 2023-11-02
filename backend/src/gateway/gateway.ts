import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyManager } from 'src/game/lobbiesManager';

@WebSocketGateway(3001, { namespace: 'events', cors: true })
export class EventsGateway {
  constructor(private readonly lobbyManager: LobbyManager) {}
  //To get an instance of the server, so we can send message to every clients of the server and more
  @WebSocketServer()
  server: Server;

  //Detect clients connections
  handleConnection(client: Socket) {
    console.log('New user connected');

    // send message to the client that listen a 'welcome' event
    client.emit('welcome', 'Welcome to the WebSocket server!');

    // send message to all clients of the server on 'reponse' event using the server instance
    this.server.emit('response', 'A new client just connect');
  }

  @SubscribeMessage('join')
  newArrival(@MessageBody() msg: string) {
    try {
      const { login } = JSON.parse(msg);
      this.server.emit('newArrival', `${login} has join the transcendence !`);
    } catch (e) {
      console.error(e);
    }
  }

  // Define actions when receiving an event, 'message' event in this case
  @SubscribeMessage('message')
  receiveNewMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Print the message received by a client
    console.log(message);

    // send hello to the client that listen a 'response' event
    client.emit('response', 'hello');
  }

  @SubscribeMessage('disconnect')
  disconnectUser(
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ) {
    const { login } = JSON.parse(body);

    if (!client.disconnected) client.disconnect();
    this.server.emit('newDepart', `${login} has just left the transcendence !`);
  }

  @SubscribeMessage('newJoinChat')
  JoinChat(@MessageBody() body: string) {
    this.server.emit('newJoinChat', body);
  }

  @SubscribeMessage('joinGame')
  CreateLobby(@MessageBody() body: number, @ConnectedSocket() client: Socket) {
    this.lobbyManager.findLobby(client, body);
  }

  @SubscribeMessage('endGame')
  endGame(@ConnectedSocket() client: Socket, @MessageBody() body: string) {
    const lobby = this.lobbyManager.findLobbyByClient(client);

    if (lobby && lobby.clients.length === 2) {
      if (client.id === lobby.clients[0].id && body == 'A')
        this.lobbyManager.destroyLobby(lobby);
      else if (client.id === lobby.clients[1].id && body == 'B')
        this.lobbyManager.destroyLobby(lobby);
    }
  }
  //Detect clients disconnection
  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('new Client disconnected');
    this.lobbyManager.leaveLobby(client);
  }
}
