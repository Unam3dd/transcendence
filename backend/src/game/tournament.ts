import { PlayerInfo } from 'src/interfaces/game.interfaces';
import { LobbyManager } from './lobbiesManager';
import { Lobby } from './lobby';
import { gameState } from 'src/enum/gameState.enum';

export class Tournament extends Lobby {
  roundCount: number = 0;

  roundTotal: number = 0;

  livePlayers: PlayerInfo[];

  currentMatch: Lobby[];

  constructor(
    public readonly maxSize: number,
    public readonly lobbyManager: LobbyManager,
  ) {
    super(maxSize, lobbyManager);
    this.state = gameState.waiting;
    console.log('Tournament created : ', this.id);
  }

  public addClient(player: PlayerInfo): void {
    if (this.players.length >= this.maxSize) return;

    this.players.push(player);
    this.sendToAll('gameMessage', 'Someone joined the tournament');

    if (this.players.length === this.maxSize) this.startTournament();
  }

  public startTournament(): void {
    this.state = gameState.playing;
    if (this.players.length < 5) this.roundTotal = 2;
    else this.roundTotal = 3;
    this.livePlayers = this.players;

    this.launchMatch(this.livePlayers);
  }

  public launchMatch(players: PlayerInfo[]): void {
    let match: Lobby;
    let index = 0;
    this.currentMatch = [];
    this.roundCount++;

    if (this.state === gameState.finish) return;
    while (players.length - index >= 2) {
      match = this.lobbyManager.createLobby(2, players[index]);
      match.addClient(players[index + 1]);
      index = index + 2;
      this.currentMatch.push(match);
    }
    this.livePlayers = [];
    if (players.length - index) this.livePlayers.push(players[index]);
  }

  public nextRound() {
    this.sendToAll('gameMessage', 'Next round in 5 seconds!');
    setTimeout(() => {
      this.launchMatch(this.livePlayers);
    }, 5000);
  }

  public handleVictory(player: PlayerInfo) {
    let launch: boolean = true;
    this.sendToAll('gameMessage', 'A match just finished');

    //If this was the final match then call finishTournament()
    console.log('Round Count before handling victory', this.roundCount);
    if (this.roundCount === this.roundTotal) {
      this.finishTournament(player);
      return;
    }

    //Adding the winner in the array of livePlayers
    this.livePlayers.push(player);

    //Check if all match of this round are terminated before launching new round
    for (const match of this.currentMatch) {
      if (match.state === gameState.playing) launch = false;
    }

    //Remove loosers from livePlayers array
    this.ejectFromTournament(player);

    //If launch === true we are ready for next round
    if (launch) this.nextRound();
  }

  public ejectFromTournament(winner: PlayerInfo): void {
    const match = this.lobbyManager.findLobbyByPlayer(winner);

    for (const player of match.players) {
      if (player !== winner) this.removeClient(player);
    }
    this.lobbyManager.destroyLobby(match);
  }

  public playerDisconnect(player: PlayerInfo): void {
    this.state = gameState.finish;

    if (this.currentMatch) {
      for (const match of this.currentMatch)
        this.lobbyManager.destroyLobby(match);
    }

    this.sendToAll(
      'gameMessage',
      `Tournament is over because ${player.login} has disconnected`,
    );

    this.gameInstance.endGame();
    this.lobbyManager.destroyLobby(this);
  }

  public finishTournament(winner: PlayerInfo): void {
    this.sendToAll(
      'gameMessage',
      `${winner.login} is the winner of this tournament`,
    );
    this.lobbyManager.destroyLobby(this.currentMatch[0]);
    this.lobbyManager.destroyLobby(this);
  }
}
