import { Lobby } from './lobby';
import { PlayerInfo } from 'src/interfaces/game.interfaces';
import { gameState } from 'src/enum/gameState.enum';

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

  public pressButton(player: PlayerInfo, button: string): void {
    if (this && this.lobby.players.length === 2) {
      if (player === this.lobby.players[0] && button == 'ArrowUp')
      {
        this.lobby.players[0].socket.emit('playerMoveUp', player.login);
        this.lobby.players[1].socket.emit('playerMoveUp', player.login);

        //this.gameVictory(player);
      }
      else if (player === this.lobby.players[1] && button == 'ArrowDown')
      {
        this.lobby.players[0].socket.emit('playerMoveDown', player.login);
        this.lobby.players[1].socket.emit('playerMoveDown', player.login);
        //this.gameVictory(player);
      }
    }
  }

  public gameVictory(player: PlayerInfo): void {
    const tournois = this.lobby.lobbyManager.findTournamentByPlayer(player);

    this.lobby.sendToAll('endGame', null);
    this.printResult(player.login);

    this.lobby.state = gameState.finish;

    if (tournois) tournois.handleVictory(player);
    this.lobby.finishGame();
  }
}
