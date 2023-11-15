import { Socket, Server } from 'socket.io';
import { Lobby } from './lobby';
import { Tournament } from './tournament';
import { PlayerInfo } from 'src/interfaces/game.interfaces';
import { gameState } from 'src/enum/gameState.enum';
import { ClientInfo } from 'src/interfaces/user.interfaces';
import { Injectable } from '@nestjs/common';
import { GameService } from '../game/game.service';

//This class handle all lobbies and tournaments
@Injectable()
export class LobbyServices {
  public lobbies: Map<Lobby['id'], Lobby | Tournament> = new Map<
    Lobby['id'],
    Lobby | Tournament
  >();

  constructor(private readonly gameService: GameService) {}
  //Search for a lobby of desired size, if no place found, create a new lobby
  public findLobby(
    player: PlayerInfo,
    lobbySize: number,
    server: Server,
  ): void {
    if (this.findLobbyByPlayer(player) || this.findTournamentByPlayer(player)) {
      console.log('Client is already in a lobby!');
      return;
    }
    const lobby = this.searchLobby(lobbySize);

    if (lobby) lobby.addClient(player);
    else this.createLobby(lobbySize, player, server);
  }

  public createLobby(
    maxSize: number,
    player: PlayerInfo,
    server: Server,
  ): Lobby {
    let newLobby: Lobby | Tournament;

    if (maxSize === 2) newLobby = new Lobby(maxSize, this, server, this.gameService);
    if (maxSize > 2) newLobby = new Tournament(maxSize, this, server, this.gameService);

    this.lobbies.set(newLobby.id, newLobby);
    newLobby.addClient(player);
    return newLobby;
  }

  createPrivateLobby(
    player: ClientInfo,
    oppponentPalyer: ClientInfo,
    server: Server,
  ): string | null {
    const opponentInfo: PlayerInfo = {
      socket: oppponentPalyer.client,
      nickName: oppponentPalyer.nickName,
      avatar: oppponentPalyer.avatar,
      score: 0,
    };
    const playerInfo: PlayerInfo = {
      socket: player.client,
      nickName: player.nickName,
      avatar: player.avatar,
      score: 0,
    };
    if (
      this.findLobbyByPlayer(opponentInfo) ||
      this.findTournamentByPlayer(opponentInfo)
    )
      return null;
    const newLobby = new Lobby(2, this, server, this.gameService);
    this.lobbies.set(newLobby.id, newLobby);
    newLobby.addClient(playerInfo);
    newLobby.addPrivateOpponent(opponentInfo.nickName);
    return newLobby.id;
  }

  // Search for a place in an existing lobby
  public searchLobby(lobbySize: number): Lobby | Tournament | null {
    for (const lobby of this.lobbies) {
      if (
        lobbySize === lobby[1].maxSize &&
        lobby[1].maxSize > lobby[1].players.length &&
        lobby[1].state === gameState.waiting
      )
        return lobby[1];
    }
    return null;
  }

  public leaveLobby(player: PlayerInfo, lobby: Lobby): void {
    lobby.removeClient(player);
    console.log('client = ', player.nickName, ' removed');
    if (lobby.players.length === 0) {
      console.log('lobby ', lobby.id, 'has been deleted');
      this.lobbies.delete(lobby.id);
    }
    return;
  }

  public destroyLobby(lobby: Lobby): void {
    while (lobby.players.length) {
      console.log(lobby.players[0].nickName);
      this.leaveLobby(lobby.players[0], lobby);
    }
  }

  clientDisconnect(client: Socket): void {
    const player = this.findUserBySocket(client);
    if (!player) return;

    const tournois = this.findTournamentByPlayer(player);

    const lobby = this.findLobbyByPlayer(player);

    if (tournois) tournois.playerDisconnect(player);
    else if (lobby) lobby.playerDisconnect(player);
  }

  public findLobbyByPlayer(player: PlayerInfo): Lobby | null {
    for (const lobby of this.lobbies) {
      for (const user of lobby[1].players) {
        if (user.nickName === player.nickName && lobby[1].maxSize === 2)
          return lobby[1] as Lobby;
      }
    }
    return null;
  }

  public findTournamentByPlayer(player: PlayerInfo): Tournament | null {
    for (const lobby of this.lobbies) {
      for (const user of lobby[1].players) {
        if (user.nickName === player.nickName && lobby[1].maxSize > 2)
          return lobby[1] as Tournament;
      }
    }
    return null;
  }

  public findUserBySocket(client: Socket): PlayerInfo {
    for (const lobby of this.lobbies) {
      for (const user of lobby[1].players) {
        if (user.socket.id === client.id) return user;
      }
    }
  }
}
