import { Socket } from 'socket.io';

export interface PlayerInfo {
    socket: Socket,
    login: string
}