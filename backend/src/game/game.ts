import { Lobby } from './lobby';

export class gameInstance {
  constructor(private readonly lobby: Lobby) {}

  launchGame(): void {
    this.lobby.clients.forEach((client) => {
      client.emit('display');
    });
  }
}
