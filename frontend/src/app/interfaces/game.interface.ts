/** Game Interfaces */
export interface gameInvitationPayload {
    gameId: string;
    host: string;
    hostAvatar: string;
}

export interface playersInfo {
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

    playerLeft: playersInfo;
    playerRight: playersInfo;
  }

  export interface LocalPlayer {
    nickName: string;
  }

  export interface GamePayload {
    lobby: string,
    size: number,
    victory: boolean
  }

  export interface PlayerResult extends GamePayload{
    local: boolean,
  }
  
  export interface GameResult extends PlayerResult{
    createdAt: string
  }