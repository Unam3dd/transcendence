import { Socket } from 'socket.io';
import { v4 } from 'uuid';
import { gameInstance } from './game';
import { LobbyManager } from './lobbiesManager';

export enum gameState {
  waiting = 1,
  playing,
  finish,
}

export class Lobby {
  public id: string;

  public clients: Socket[] = [];

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

  public addClient(client: Socket): void {
    if (this.clients.length >= this.maxSize) return;

    this.clients.push(client);
    this.sendToAll('gameMessage', 'Someone joined the lobby');

    if (this.clients.length === this.maxSize) this.gameInstance.launchGame();
  }

  public removeClient(client: Socket): void {
    const index = this.clients.indexOf(client);
    if (index !== -1) this.clients.splice(index, 1);

    this.sendToAll('gameMessage', 'Someone has leave the lobby');
  }

  public playerDisconnect(client: Socket): void {
    this.state = gameState.finish;
    this.sendToAll(
      'gameMessage',
      `Game is over becaune ${client.id} has disconnected`,
    );
    this.finishGame();
  }

  public finishGame(): void {
    this.gameInstance.endGame();
    this.lobbyManager.destroyLobby(this);
  }

  public sendToAll(event: string, msg: string): void {
    this.clients.forEach((client) => {
      client.emit(event, msg);
    });
  }
}
