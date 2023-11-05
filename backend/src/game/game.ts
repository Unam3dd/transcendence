import { Lobby, gameState } from './lobby';
import { Socket } from 'socket.io';

//In this class we define actions needed to play the game
export class gameInstance {
  constructor(private readonly lobby: Lobby) {}

  public launchGame(): void {
    this.lobby.state = gameState.playing;
    this.lobby.sendToAll('display', null);
  }

  public endGame(): void {
    this.lobby.sendToAll('endGame', null);
  }

  public printResult(winner: string): void {
    this.lobby.sendToAll('gameMessage', `${winner} has won the match!`);
  }

  public pressButton(client: Socket, button: string): void {
    if (this && this.lobby.clients.length === 2) {
      if (client.id === this.lobby.clients[0].id && button == 'A')
        this.gameVictory(client);
      else if (client.id === this.lobby.clients[1].id && button == 'B')
        this.gameVictory(client);
    }
  }

  public gameVictory(client: Socket): void {
    const tournois = this.lobby.lobbyManager.findTournamentByClient(client);

    this.lobby.sendToAll('endGame', null);
    this.printResult(client.id);

    this.lobby.state = gameState.finish;

    if (tournois) tournois.handleVictory(client);
    this.lobby.finishGame();
  }
}
