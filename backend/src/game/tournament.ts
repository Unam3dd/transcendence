import { LobbyManager } from './lobbiesManager';
import { Lobby, gameState } from './lobby';
import { Socket } from 'socket.io';

export class Tournament extends Lobby {
  roundCount: number = 0;

  roundTotal: number = 0;

  livePlayers: Socket[];

  currentMatch: Lobby[];

  constructor(
    public readonly maxSize: number,
    public readonly lobbyManager: LobbyManager,
  ) {
    super(maxSize, lobbyManager);
    this.state = gameState.waiting;
    console.log('Tournament created : ', this.id);
  }

  public addClient(client: Socket): void {
    if (this.clients.length >= this.maxSize) return;

    this.clients.push(client);
    this.sendToAll('gameMessage', 'Someone joined the tournament');

    if (this.clients.length === this.maxSize) this.startTournament();
  }

  public startTournament(): void {
    this.state = gameState.playing;
    if (this.clients.length < 5) this.roundTotal = 2;
    else this.roundTotal = 3;
    this.livePlayers = this.clients;

    this.launchMatch(this.livePlayers);
  }

  public launchMatch(players: Socket[]): void {
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

  public handleVictory(client: Socket) {
    let launch: boolean = true;
    this.sendToAll('gameMessage', 'A match just finished');

    //If this was the final match then call finishTournament()
    console.log('Round Count before handling victory', this.roundCount);
    if (this.roundCount === this.roundTotal) {
      this.finishTournament(client);
      return;
    }

    //Adding the winner in the array of livePlayers
    this.livePlayers.push(client);

    //Check if all match of this round are terminated before launching new round
    for (const match of this.currentMatch) {
      if (match.state === gameState.playing) launch = false;
    }

    //Remove loosers from livePlayers array
    this.ejectFromTournament(client);

    //If launch === true we are ready for next round
    if (launch) this.nextRound();
  }

  public ejectFromTournament(client: Socket): void {
    const match = this.lobbyManager.findLobbyByClient(client);

    for (const player of match.clients) {
      if (player !== client) this.removeClient(player);
    }
    this.lobbyManager.destroyLobby(match);
  }

  public playerDisconnect(client: Socket): void {
    this.state = gameState.finish;
    for (const match of this.currentMatch)
      this.lobbyManager.destroyLobby(match);

    this.sendToAll(
      'gameMessage',
      `Tournament is over because ${client.id} has disconnected`,
    );

    this.gameInstance.endGame();
    this.lobbyManager.destroyLobby(this);
  }

  public finishTournament(winner: Socket): void {
    this.sendToAll(
      'gameMessage',
      `${winner.id} is the winner of this tournament`,
    );
    this.lobbyManager.destroyLobby(this.currentMatch[0]);
    this.lobbyManager.destroyLobby(this);
  }
}
