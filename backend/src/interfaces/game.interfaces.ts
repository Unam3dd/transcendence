import { Socket } from 'socket.io';

export interface PlayerInfo {
  socket: Socket;
  nickName: string;
  score: number;
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
  playerLeftScore: number;
  playerRightScore: number;
}
