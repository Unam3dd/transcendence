import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyManager } from 'src/game/lobbiesManager';
import { PlayerInfo, playPayload } from 'src/interfaces/game.interfaces';
import { ClientInfo } from 'src/interfaces/user.interfaces';

@WebSocketGateway(3001, { namespace: 'events', cors: true })
export class EventsGateway {
  constructor(private readonly lobbyManager: LobbyManager) {}
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
      //const test: ClientInfo =  JSON.parse(msg);
      const found = this.clientList.find((el) => el.id === id);
      //test.client = client;
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

  /** Remote games functions */

  @SubscribeMessage('privateGame')
  CreatePrivateLobby(
    @MessageBody() body: playPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const opponent = this.clientList.find(
      (el) => el.nickName === body.opponentNickname,
    );
    const player = this.clientList.find((el) => el.nickName === body.nickName);
    if (!opponent || !player) return;

    const opponentInfo: PlayerInfo = {
      socket: opponent.client,
      nickName: opponent.nickName,
      avatar: opponent.avatar,
      score: 0,
    };
    const playerInfo: PlayerInfo = {
      socket: client,
      nickName: player.nickName,
      avatar: player.avatar,
      score: 0,
    };

    const gameId = this.lobbyManager.createPrivateLobby(
      playerInfo,
      opponentInfo,
      this.server,
    );
    if (!gameId) return;

    opponent.client.emit('gameInvitation', {
      gameId: gameId,
      host: player.nickName, //voir pour add avatar?
    });
  }

  @SubscribeMessage('declinePrivateGame')
  declinePrivateGame(@MessageBody() body: playPayload) {
    const lobby = this.lobbyManager.lobbies.get(body.gameId);
    if (!lobby) return;
    lobby.sendMessageToAll('declined', null);
    this.lobbyManager.destroyLobby(lobby);
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
    const lobby = this.lobbyManager.lobbies.get(body.gameId);
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
    this.lobbyManager.findLobby(playerInfo, body.size, this.server);
  }

  @SubscribeMessage('pressButton')
  pressButton(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: playPayload,
  ) {
    const player = this.lobbyManager.findUserBySocket(client);
    if (!player) return;
    const lobby = this.lobbyManager.findLobbyByPlayer(player);
    if (!lobby) return;
    lobby.gameInstance.pressButton(player, body.button);
  }

  @SubscribeMessage('quitLobby')
  quitLobby(@ConnectedSocket() client: Socket) {
    const player = this.lobbyManager.findUserBySocket(client);
    if (!player) return;

    const lobby = this.lobbyManager.findLobbyByPlayer(player);
    if (lobby && lobby.players.length != lobby.maxSize)
      lobby.lobbyManager.leaveLobby(player, lobby);

    const tournament = this.lobbyManager.findTournamentByPlayer(player);
    if (tournament && tournament.players.length != tournament.maxSize)
      this.lobbyManager.leaveLobby(player, tournament);
  }

  //Detect clients disconnection

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('new Client disconnected');
    this.lobbyManager.clientDisconnect(client);
    for (const el of this.clientList) {
      if (el.client.id === client.id) {
        el.client.disconnect();
        this.server.emit(
          'newDepart',
          `${el.nickName} (${el.login}) has left transcendence`,
        );
        const index = this.clientList.indexOf(el);
        this.clientList.splice(index, 1);
        //this.ListClient();
        return;
      }
    }
  }
}
