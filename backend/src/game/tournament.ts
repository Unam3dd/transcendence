import { PlayerInfo } from 'src/interfaces/game.interfaces';
import { LobbyManager } from './lobbiesManager';
import { Lobby } from './lobby';
import { gameState } from 'src/enum/gameState.enum';
import { Server } from 'socket.io';

export class Tournament extends Lobby {
  roundCount: number = 0;

  roundTotal: number = 0;

  livePlayers: PlayerInfo[] = [];

  currentMatch: Lobby[] = [];

  constructor(
    public readonly maxSize: number,
    public readonly lobbyManager: LobbyManager,
    public readonly server: Server,
  ) {
    super(maxSize, lobbyManager, server);
    this.state = gameState.waiting;
    console.log('Tournament created : ', this.id);
  }

  public addClient(player: PlayerInfo): void {
    if (this.players.length >= this.maxSize) return;
    player.socket.join(this.id);
    this.players.push(player);
    this.sendMessageToAll('gameMessage', 'Someone joined the tournament');

    if (this.players.length === this.maxSize) this.startTournament();
  }

  public removeClient(player: PlayerInfo): void {
    const index = this.players.indexOf(player);
    if (index !== -1) {
      player.socket.leave(this.id);
      this.players.splice(index, 1);
    }
    this.sendMessageToAll('gameMessage', 'Someone has leave the toournament');
    if (this.players.length === 0) this.lobbyManager.destroyLobby(this);
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

    if (this.livePlayers.length === 1) {
      this.finishTournament(this.livePlayers[0]);
      return;
    }
    while (players.length - index >= 2) {
      match = this.lobbyManager.createLobby(2, players[index], this.server);
      match.addClient(players[index + 1]);
      index = index + 2;
      this.currentMatch.push(match);
    }
    this.livePlayers = [];
    if (players.length - index) this.livePlayers.push(players[index]);
  }

  public nextRound() {
    console.log('next round in 5 seconds');

    this.sendMessageToAll('gameMessage', 'Next round in 5 seconds!');
    setTimeout(() => {
      this.launchMatch(this.livePlayers);
    }, 5000);
  }

  public handleVictory(player: PlayerInfo) {
    let launch: boolean = true;
    this.sendMessageToAll('gameMessage', 'A match just finished');

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
    const match = this.lobbyManager.findLobbyByPlayer(player);
    if (this.players.length === 1)
    {
      this.lobbyManager.destroyLobby(this);
      return ;
    }
    if (!match) { 
      const index = this.livePlayers.indexOf(player);
      if (index !== -1) this.livePlayers.splice(index, 1);
      this.removeClient(player);
      return;
    }

    clearInterval(match.gameInstance.gameInterval);
    match.state = gameState.finish;

    match.sendMessageToAll(
      'gameMessage',
      `Game is over becaune ${player.nickName} has disconnected llalala`,
    );
    if (player === match.players[0]) this.handleVictory(match.players[1]);
    else this.handleVictory(match.players[0]);
  }

  public finishTournament(winner: PlayerInfo): void {
    this.sendMessageToAll(
      'gameMessage',
      `${winner.nickName} is the winner of this tournament`,
    );
    if (this.currentMatch[0])
      this.lobbyManager.destroyLobby(this.currentMatch[0]);
    this.lobbyManager.destroyLobby(this);
  }
}
