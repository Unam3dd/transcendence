import { Socket } from 'socket.io';

export interface PlayerInfo {
  socket: Socket;
  login: string;
  score: number;
}

export interface playPayload {
  login: string;
  size?: number;
  button?: string;
}

export interface GameInfo {
  barLeftY: number;
  barRightY: number;
  barHeight: number;
  barWidth: number;

  ballX: number;
  ballY: number;
  ballRadius: number;
  playerLeftScore: number;
  playerRightScore: number;
}
