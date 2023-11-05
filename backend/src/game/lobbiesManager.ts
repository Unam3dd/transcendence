import { Socket } from 'socket.io';
import { Lobby, gameState } from './lobby';
import { Tournament } from './tournament';

//This class handle all lobbies and tournaments
export class LobbyManager {
  public lobbies: Map<Lobby['id'], Lobby | Tournament> = new Map<
    Lobby['id'],
    Lobby | Tournament
  >();

  //Search for a lobby of desired size, if no place found, create a new lobby
  public findLobby(client: Socket, lobbySize: number): void {
    if (this.findLobbyByClient(client) || this.findTournamentByClient(client)) {
      console.log('Client is already in a lobby!');
      return;
    }
    const lobby = this.searchLobby(lobbySize);

    if (lobby) lobby.addClient(client);
    else this.createLobby(lobbySize, client);
  }

  public createLobby(maxSize: number, client: Socket): Lobby {
    let newLobby: Lobby | Tournament;

    if (maxSize === 2) newLobby = new Lobby(maxSize, this);
    if (maxSize > 2) newLobby = new Tournament(maxSize, this);

    this.lobbies.set(newLobby.id, newLobby);
    newLobby.addClient(client);
    return newLobby;
  }

  // Search for a place in an existing lobby
  public searchLobby(lobbySize: number): Lobby | Tournament | null {
    for (const lobby of this.lobbies) {
      if (
        lobbySize === lobby[1].maxSize &&
        lobby[1].maxSize > lobby[1].clients.length &&
        lobby[1].state === gameState.waiting
      )
        return lobby[1];
    }
    return null;
  }

  public leaveLobby(client: Socket, lobby: Lobby): void {
    lobby.removeClient(client);
    console.log('client = ', client.id, ' removed');
    if (lobby.clients.length === 0) {
      console.log('lobby ', lobby.id, 'has been deleted');
      this.lobbies.delete(lobby.id);
    }
    return;
  }

  public destroyLobby(lobby: Lobby): void {
    while (lobby.clients.length) {
      console.log(lobby.clients[0].id);
      this.leaveLobby(lobby.clients[0], lobby);
    }
  }

  clientDisconnect(client: Socket) {
    const tournois = this.findTournamentByClient(client);
    const lobby = this.findLobbyByClient(client);
    if (tournois) tournois.playerDisconnect(client);
    else if (lobby) lobby.playerDisconnect(client);
  }

  public findLobbyByClient(client: Socket): Lobby | null {
    for (const lobby of this.lobbies) {
      for (const user of lobby[1].clients) {
        if (user.id === client.id && lobby[1].maxSize === 2)
          return lobby[1] as Lobby;
      }
    }
    return null;
  }

  public findTournamentByClient(client: Socket): Tournament | null {
    for (const lobby of this.lobbies) {
      for (const user of lobby[1].clients) {
        if (user.id === client.id && lobby[1].maxSize > 2)
          return lobby[1] as Tournament;
      }
    }
    return null;
  }
}
