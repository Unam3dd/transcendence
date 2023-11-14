import { Socket } from 'socket.io';

export interface PlayerInfo {
  socket: Socket;
  nickName: string;
  avatar: string;
  score: number;
}

export interface playPayload {
  nickName: string;
  size?: number;
  button?: string;
  opponentNickname?: string;
  gameId?: string;
}

export interface PlayersPayload {
  nickName: string;
  avatar: string;
  score: number;
}

export interface GameInfo {
  barLeftY: number;
  barRightY: number;
  barHeight: number;
  barWidth: number;

  ballX: number;
  ballY: number;
  ballRadius: number;

  playerLeft: PlayersPayload;
  playerRight: PlayersPayload;
}

export interface GamePayload {
  lobby: string,
  size: number,
  victory: boolean
}
