import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';
import { gameInstance } from './game';

@Injectable()
export class Lobby {
  public id: string;

  public clients: Socket[] = [];

  public readonly maxSize: number;

  public readonly gameInstance = new gameInstance(this);

  constructor(public readonly size: number) {
    this.maxSize = size;
    this.id = v4();
  }

  public addClient(client: Socket): void {
    if (this.clients.length < this.maxSize) {
      this.clients.push(client);
      this.sendToAll('newPlayer', 'Someone joined the lobby');
      if (this.clients.length === this.maxSize) this.gameInstance.launchGame();
    }
  }

  public removeClient(client: Socket): void {
    const index = this.clients.indexOf(client);
    if (index !== -1) this.clients.splice(index, 1);

    this.sendToAll('newPlayer', 'Someone has leave the lobby');
  }

  public endGame(): void {
    this.sendToAll('newPlayer', 'Game is finished');
    this.sendToAll('endGame', null);
  }

  public sendToAll(event: string, msg: string): void {
    this.clients.forEach((client) => {
      client.emit(event, msg);
    });
  }
}
