import { Injectable } from '@nestjs/common';
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
import { PlayerInfo, playPayload } from 'src/interfaces/game.interfaces';
import { LobbyServices } from 'src/modules/remote-game/lobbiesServices';

@Injectable()
@WebSocketGateway(3001, { namespace: 'events', cors: true })
export class EventsGateway {
  constructor(private readonly lobbyServices: LobbyServices, private block: BlockService) {}

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
  newArrival(@ConnectedSocket() client: Socket, @MessageBody() msg: string) {
    try {
      const { id, login } = JSON.parse(msg);

      const found = this.clientList.find((el) => el.id === id);
  
      if (!found) {
        this.clientList.push({
          ...JSON.parse(msg),
          client,
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
    this.ListClient();
  }

  /** Remote games functions */

  @SubscribeMessage('privateGame')
  CreatePrivateLobby(@MessageBody() body: playPayload) {
    const opponent = this.clientList.find(
      (el) => el.nickName === body.opponentNickname,
    );
    const player = this.clientList.find((el) => el.nickName === body.nickName);
    if (!opponent || !player) return;

    const gameId = this.lobbyServices.createPrivateLobby(
      player,
      opponent,
      this.server,
    );
    if (!gameId) return;

    opponent.client.emit('gameInvitation', {
      gameId: gameId,
      host: player.nickName,
      hostAvatar: player.avatar,
    });
  }

  @SubscribeMessage('declinePrivateGame')
  declinePrivateGame(@MessageBody() body: playPayload) {
    const lobby = this.lobbyServices.lobbies.get(body.gameId);
    if (!lobby) return;
    lobby.sendMessageToAll('declined', null);
    this.lobbyServices.destroyLobby(lobby);
  }

  @SubscribeMessage('joinPrivateGame')
  joinPrivateGame(
    @MessageBody() body: playPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const player = this.clientList.find((el) => el.nickName === body.nickName);
    if (!player) return;
    const playerInfo: PlayerInfo = {
      socket: client,
      nickName: player.nickName,
      avatar: player.avatar,
      score: 0,
    };
    const lobby = this.lobbyServices.lobbies.get(body.gameId);
    if (!lobby) return;
    lobby.joinPrivateLobby(playerInfo);
  }

  @SubscribeMessage('joinGame')
  CreateLobby(
    @MessageBody() body: playPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const player = this.clientList.find((el) => el.nickName === body.nickName);
    if (!player) return;
    const playerInfo: PlayerInfo = {
      socket: client,
      nickName: player.nickName,
      avatar: player.avatar,
      score: 0,
    };
    this.lobbyServices.findLobby(playerInfo, body.size, this.server);
  }

  @SubscribeMessage('pressButton')
  pressButton(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: playPayload,
  ) {
    const player = this.lobbyServices.findUserBySocket(client);
    if (!player) return;
    const lobby = this.lobbyServices.findLobbyByPlayer(player);
    if (!lobby) return;
    lobby.gameInstance.pressButton(player, body.button);
  }

  @SubscribeMessage('quitLobby')
  quitLobby(@ConnectedSocket() client: Socket) {
    const player = this.lobbyServices.findUserBySocket(client);
    if (!player) return;

    const lobby = this.lobbyServices.findLobbyByPlayer(player);
    if (lobby && lobby.players.length != lobby.fullSize)
      lobby.lobbyManager.leaveLobby(player, lobby);
  }

   /** End of Remote games functions */

  //Detect clients disconnection

  handleDisconnect(@ConnectedSocket() client: Socket) {

    console.log('new user just disconnected !');
    this.lobbyServices.clientDisconnect(client);
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
        clientID: el.client.id,
      }
      
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
