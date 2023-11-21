import { v4 } from 'uuid';
import { gameInstance } from './game';
import { LobbyServices } from './lobbiesServices';
import {
  GameInfo,
  GamePayload,
  PlayerInfo,
} from 'src/interfaces/game.interfaces';
import { gameState } from 'src/enum/gameState.enum';
import { Server } from 'socket.io';
import { GameService } from '../game/game.service';

export class Lobby {
  public id: string;

  public players: PlayerInfo[] = [];

  public readonly gameInstance = new gameInstance(this);

  state: gameState;

  fullSize: number = 2;

  invitedOpponent: string | null = null;

  constructor(
    public readonly lobbyManager: LobbyServices,
    public readonly server: Server,
    public readonly gameService: GameService,
  ) {
    this.id = v4();
    this.state = gameState.waiting;

    console.log('Lobby created : ', this.id);
  }

  public addClient(player: PlayerInfo): void {
    if (this.players.length >= this.fullSize) return;
    player.score = 0;
    player.socket.join(this.id);
    this.players.push(player);
    this.sendMessageToAll('gameMessage', 'Someone joined the lobby');

    if (this.players.length === this.fullSize) this.gameInstance.launchGame();
  }

  public removeClient(player: PlayerInfo): void {
    const index = this.players.indexOf(player);
    if (index !== -1) {
      player.socket.leave(this.id);
      this.players.splice(index, 1);
    }
    this.sendMessageToAll('gameMessage', 'Someone has leave the lobby');
    if (this.players.length === 0) this.lobbyManager.destroyLobby(this);
  }

  public addPrivateOpponent(opponentName: string) {
    if (opponentName) this.invitedOpponent = opponentName;
  }

  public joinPrivateLobby(player: PlayerInfo) {
    if (this.lobbyManager.findLobbyByPlayer(player))
      return;
    if (this.invitedOpponent == null) return;
    if (player.nickName != this.invitedOpponent) {
      console.log('this is a private game and user is not the invited player');
      return;
    } else this.addClient(player);
  }

  async sendGameResult(player: PlayerInfo) {
    if (this.players.length != 2)
      return ;
    const payload: GamePayload = {
      lobby: this.id,
      size: this.fullSize,
      nickname: player.nickName,
      victory: true,
    };
    let looser: string;
    player.socket.emit('result', true);
    if (this.players[0] === player) {
      looser = this.players[1].nickName;
      this.players[1].socket.emit('result');
    } else {
      looser = this.players[0].nickName;
      this.players[0].socket.emit('result');
    }

    await this.gameService.createRemote(payload);
    payload.victory = false;
    payload.nickname = looser;
    await this.gameService.createRemote(payload);
  }

  public playerDisconnect(player: PlayerInfo): void {
    this.state = gameState.finish;

    this.sendMessageToAll(
      'gameMessage',
      `Game is over becaune ${player.nickName} has disconnected`,
    );
    if (this.players[0].nickName === player.nickName)
      this.sendGameResult(this.players[1]);
    else this.sendGameResult(this.players[0]);
    this.gameInstance.stopGame();
  }

  public sendMessageToAll(event: string, msg: string): void {
    this.server.to(this.id).emit(event, msg);
  }

  public sendGameEventToAll(event: string, param: GameInfo): void {
    this.server.to(this.id).emit(event, param);
  }
}
