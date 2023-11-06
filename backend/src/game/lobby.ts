import { v4 } from 'uuid';
import { gameInstance } from './game';
import { LobbyManager } from './lobbiesManager';
import { PlayerInfo } from 'src/interfaces/game.interfaces';
import { gameState } from 'src/enum/gameState.enum';

export class Lobby {
  public id: string;

  public players: PlayerInfo[] = [];

  public readonly gameInstance = new gameInstance(this);

  public readonly size: number;

  state: gameState;

  constructor(
    public readonly maxSize: number,
    public readonly lobbyManager: LobbyManager,
  ) {
    this.id = v4();
    this.size = maxSize;
    this.state = gameState.waiting;

    if (maxSize === 2) console.log('Lobby created : ', this.id);
  }

  public addClient(player: PlayerInfo): void {
    if (this.players.length >= this.maxSize) return;

    this.players.push(player);
    this.sendToAll('gameMessage', 'Someone joined the lobby');

    if (this.players.length === this.maxSize) this.gameInstance.launchGame();
  }

  public removeClient(player: PlayerInfo): void {
    const index = this.players.indexOf(player);
    if (index !== -1) this.players.splice(index, 1);

    this.sendToAll('gameMessage', 'Someone has leave the lobby');
  }

  public playerDisconnect(player: PlayerInfo): void {
    this.state = gameState.finish;
    this.sendToAll(
      'gameMessage',
      `Game is over becaune ${player.login} has disconnected`,
    );
    this.finishGame();
  }

  public finishGame(): void {
    this.gameInstance.endGame();
    this.lobbyManager.destroyLobby(this);
  }

  public sendToAll(event: string, msg: string): void {
    this.players.forEach((player) => {
      player.socket.emit(event, msg);
    });
  }
}
