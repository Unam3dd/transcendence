import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Lobby } from './lobby';

@Injectable()
export class LobbyManager {
  public lobbies: Map<Lobby['id'], Lobby> = new Map<Lobby['id'], Lobby>();

  public readonly server: Server;

  public findLobby(client: Socket, lobbySize: number): void {
    //Check if User is already in a Lobby
    if (this.findLobbyByClient(client)) {
      console.log('You are already in a lobby!');
      return;
    }

    // Search for a place in an existing lobby, if not it creates a new lobby
    const lobby = this.searchLobby(lobbySize);

    if (lobby) {
      lobby.addClient(client);
      console.log('client added to this lobby = ', lobby.id);
    } else this.createLobby(lobbySize, client);
  }

  //Create a new Lobby
  public createLobby(maxSize: number, client: Socket): void {
    const newLobby = new Lobby(maxSize);
    this.lobbies.set(newLobby.id, newLobby);
    console.log('new lobby created = ', newLobby.id);
    newLobby.addClient(client);
  }

  public searchLobby(lobbySize: number): Lobby | null {
    for (const lobby of this.lobbies) {
      if (
        lobbySize === lobby[1].maxSize &&
        lobby[1].maxSize > lobby[1].clients.length
      )
        return lobby[1];
    }
    return null;
  }

  public leaveLobby(client: Socket): void {
    const lobby = this.findLobbyByClient(client);

    if (!lobby) return;

    lobby.removeClient(client);

    if (lobby.clients.length === 0) {
      console.log('lobby ', lobby.id, 'has been deleted');
      this.lobbies.delete(lobby.id);
    }
  }

  public destroyLobby(lobby: Lobby): void {
    lobby.endGame();
    while (lobby.clients.length) this.leaveLobby(lobby.clients[0]);
  }

  //Check if user is already in a Lobby, it returns null if user is not in a lobby
  public findLobbyByClient(client: Socket): Lobby | null {
    for (const lobby of this.lobbies) {
      for (const user of lobby[1].clients) {
        if (user.id === client.id) return lobby[1];
      }
    }
    return null;
  }
}
