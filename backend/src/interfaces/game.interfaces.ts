import { Socket } from 'socket.io';

export interface PlayersPayload {
  nickName: string;
  avatar: string;
  score: number;
}

export interface PlayerInfo extends PlayersPayload{
  socket: Socket;
}

export interface playPayload {
  nickName: string;
  size?: number;
  button?: string;
  opponentNickname?: string;
  gameId?: string;
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
  nickname: string,
  victory: boolean
}
