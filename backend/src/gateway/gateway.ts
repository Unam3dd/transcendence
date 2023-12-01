import { Injectable, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnlineState } from 'src/enum/status.enum';
import { PlayerInfo, playPayload } from 'src/interfaces/game.interfaces';
import { UserFriendsInfo, UserStatus } from 'src/interfaces/user.interfaces';
import {
  ClientInfo,
  ListUserSanitizeInterface,
} from 'src/interfaces/user.interfaces';
import { BlockedUser } from 'src/interfaces/user.interfaces';
import { LobbyServices } from 'src/modules/remote-game/lobbiesServices';
import { FriendsService } from 'src/modules/friends/friends.service';
import { UsersService } from 'src/modules/users/users.service';
import { BlockService } from 'src/modules/block/block.service';
import { WsGuard } from './ws/ws.guard';

@UseGuards(WsGuard)
@Injectable()
@WebSocketGateway(3001, { cors: true, transports: ['websocket'] })
export class EventsGateway {
  constructor(
    private readonly lobbyServices: LobbyServices,
    private block: BlockService,
    private readonly friendsService: FriendsService,
    private readonly usersService: UsersService,
  ) {}

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
          onlineState: OnlineState.online,
        });
      }
      this.statusChange(client, OnlineState.online);
      this.server.emit('newArrival', `${login} has join the transcendence !`);
    } catch (e) {
      console.error(e);
    }
  }

  // Define actions when receiving an event, 'message' event in this case
  @SubscribeMessage('message')
  receiveNewMessage(@MessageBody() message: string) {
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

  @SubscribeMessage('quitGame')
  quitGame(@ConnectedSocket() client: Socket) {
    this.lobbyServices.clientDisconnect(client);
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

  @SubscribeMessage('statusChange')
  statusChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() newState: OnlineState,
  ) {
    const targetClient = this.clientList.find(
      (el) => el.client.id === client.id,
    );
    if (!targetClient) return;
    targetClient.onlineState = newState;
    const payload: UserStatus[] = [];
    const info: UserStatus = {
      id: targetClient.id,
      onlineState: newState,
    };
    payload.push(info);
    this.server.emit('getStatus', payload);
  }

  @SubscribeMessage('listFriends')
  async ListFriends(@MessageBody() userId: number) {
    const userFriendsInfo: UserFriendsInfo[] = [];

    const targetClient = this.clientList.find((el) => el.id === userId);
    if (!targetClient) return;
    const friendsList = await this.friendsService.listFriends(
      targetClient.id,
      false,
    );

    for (const el of friendsList) {
      let state: OnlineState;
      const user = await this.usersService.findOneSanitize(el.user2);

      if (user) {
        const userInfo = this.clientList.find((el) => el.id === user.id);
        if (userInfo) state = userInfo.onlineState;
        else state = OnlineState.offline;
        const friendInfo: UserFriendsInfo = {
          ...user,
          applicant: el.applicant,
          status: el.status,
          onlineState: state,
        };
        userFriendsInfo.push(friendInfo);
      }
    }
    targetClient.client.emit('getListFriends', userFriendsInfo);
  }

  @SubscribeMessage('updateFriend')
  updateFriend(@MessageBody() userId: number) {
    const updated = this.clientList.find((el) => el.id === userId);
    if (!updated) return;
    this.ListFriends(updated.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('new user just disconnected !');
    this.lobbyServices.clientDisconnect(client);
    for (const el of this.clientList) {
      if (el.client.id === client.id) {
        this.statusChange(client, OnlineState.offline);
        el.client.disconnect();
        this.server.emit(
          'newDepart',
          `${el.nickName} (${el.login}) has left transcendence`,
        );
        const index = this.clientList.indexOf(el);
        this.clientList.splice(index, 1);
        this.ListClient();
        return;
      }
    }
  }

  @SubscribeMessage('listClient')
  ListClient() {
    const loginArray: ListUserSanitizeInterface[] = [];

    this.clientList.forEach((el: ClientInfo) => {
      const usanitize: ListUserSanitizeInterface = {
        id: el.id,
        login: el.login,
        nickName: el.nickName,
        avatar: el.avatar,
        clientID: el.client.id,
      };

      loginArray.push(usanitize);
    });
    this.server.emit('listClient', loginArray);
  }

  @SubscribeMessage('listBlocked')
  async ListBlocked(@ConnectedSocket() client: Socket) {
    const targetClient = this.clientList.find(
      (el) => el.client.id === client.id,
    );
    if (!targetClient) return;
    const blockedList = await this.block.listBlock(targetClient.id);

    client.emit('getListBlocked', <BlockedUser[]>blockedList);
  }

  @SubscribeMessage('refreshData')
  async refreshProfileData(@ConnectedSocket() client: Socket) {
    const targetClient = this.clientList.find(
      (el) => el.client.id === client.id,
    );

    if (!targetClient) return;

    const target = await this.usersService.findOne(targetClient.id);

    if (!target) return;

    const info = {
      firstName: target.firstName,
      lastName: target.lastName,
      nickName: target.nickName,
      email: target.email,
      a2f: target.a2f,
      avatar: target.avatar,
    };

    console.log(info);

    client.emit('refreshDataProfile', info);
  }
}
