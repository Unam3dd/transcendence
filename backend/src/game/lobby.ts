import { v4 } from 'uuid';
import { gameInstance } from './game';
import { LobbyManager } from './lobbiesManager';
import { GameInfo, PlayerInfo } from 'src/interfaces/game.interfaces';
import { gameState } from 'src/enum/gameState.enum';
import { Server } from 'socket.io';

export class Lobby {
  public id: string;

  public players: PlayerInfo[] = [];

  public readonly gameInstance = new gameInstance(this);

  public readonly size: number;

  state: gameState;

  invitedOpponent: string | null = null;
  //function to set this in case of privateGame ? and verify it isn't null before joining?

  constructor(
    public readonly maxSize: number,
    public readonly lobbyManager: LobbyManager,
    public readonly server: Server,
  ) {
    this.id = v4();
    this.size = maxSize;
    this.state = gameState.waiting;

    if (maxSize === 2) console.log('Lobby created : ', this.id);
  }

  public addClient(player: PlayerInfo): void {
    if (this.players.length >= this.maxSize) return;
    player.score = 0;
    player.socket.join(this.id);
    this.players.push(player);
    this.sendMessageToAll('gameMessage', 'Someone joined the lobby');

    if (this.players.length === this.maxSize) this.gameInstance.launchGame();
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
    if (
      this.lobbyManager.findLobbyByPlayer(player) ||
      this.lobbyManager.findTournamentByPlayer(player)
    )
      return;
    if (this.invitedOpponent == null) return;
    if (player.nickName != this.invitedOpponent) {
      console.log('this is a private game and user is not the invited player');
      return;
    } else this.addClient(player);
  }

  public playerDisconnect(player: PlayerInfo): void {
    this.state = gameState.finish;
    this.sendMessageToAll(
      'gameMessage',
      `Game is over becaune ${player.nickName} has disconnected`,
    );
    this.gameInstance.stopGame();
  }

  public sendMessageToAll(event: string, msg: string): void {
    this.server.to(this.id).emit(event, msg);
  }

  public sendGameEventToAll(event: string, param: GameInfo): void {
    this.server.to(this.id).emit(event, param);
  }
}
