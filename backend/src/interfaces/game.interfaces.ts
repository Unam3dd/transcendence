import { Socket } from 'socket.io';

export interface PlayerInfo {
    socket: Socket,
    login: string,
    reset?: boolean
}

export interface EventParam {
    msg?: string,
    player?: PlayerInfo
}