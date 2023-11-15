import { Lobby } from './lobby';
import { GameInfo, GamePayload, PlayerInfo } from 'src/interfaces/game.interfaces';
import { gameState } from 'src/enum/gameState.enum';
import { GameService } from '../game/game.service';

//In this class we define actions needed to play the game
export class gameInstance {
  constructor(private readonly lobby: Lobby) {}

  gameInterval: any = 0;
  //Rackets config variables
  barLeftY: number = 0;
  barRightY: number = 0;
  barHeight: number = 50;
  barWidth: number = 10;
  barSpeed: number = 30;

  //Ball config variables
  ballX: number = 0;
  ballY: number = 0;
  ballRadius: number = 10;
  ballSpeedX: number = 0;
  ballSpeedY: number = 0;
  ballSpeed: number = 5;

  //This variable checks whether the game is running
  gameStart: boolean = false;

  public launchGame(): void {
    this.lobby.state = gameState.playing;
    this.initGame();
    this.startGame();
  }

  public initGame() {
    this.initPosition();
    this.randomDirection();
    this.sendPosition();
  }

  initPosition() {
    const centerY: number = (400 - this.barHeight) / 2;
    const centerX: number = (800 - this.ballRadius) / 2;
    const centerBallY: number = (400 - this.ballRadius) / 2;

    this.barRightY = centerY;
    this.barLeftY = centerY;

    this.ballX = centerX;
    this.ballY = centerBallY;
  }

  moveBall() {
    this.ballY += this.ballSpeedY;
    this.ballX += this.ballSpeedX;

    //Canvas hit box
    if (
      this.ballY + this.ballRadius >= 400 ||
      this.ballY - this.ballRadius <= 0
    ) {
      this.ballSpeedY = -this.ballSpeedY;
    }

    //Rackets hit box
    const leftHit = this.ballX >= 40 && this.ballX <= 40 + this.barWidth;
    const rightHit =
      this.ballX + this.ballRadius <= 800 - 40 &&
      this.ballX + this.ballRadius >= 800 - 40 - this.barWidth;

    if (
      (leftHit &&
        this.ballY >= this.barLeftY &&
        this.ballY <= this.barLeftY + this.barHeight) ||
      (rightHit &&
        this.ballY >= this.barRightY &&
        this.ballY <= this.barRightY + this.barHeight)
    ) {
      this.ballSpeedX = -this.ballSpeedX;
    }

    //increment players score
    if (this.ballX + this.ballRadius >= 800) {
      this.lobby.players[0].score++;
    } else if (this.ballX - this.ballRadius <= 0) {
      this.lobby.players[1].score++;
    }

    //reset ball position
    if (
      this.ballX + this.ballRadius >= 800 ||
      this.ballX - this.ballRadius <= 0
    ) {
      const centerX: number = (800 - this.ballRadius) / 2;
      const centerBallY: number = (400 - this.ballRadius) / 2;
      this.ballX = centerX;
      this.ballY = centerBallY;
      this.randomDirection();
    }

    //stop the game
    if (
      this.lobby.players[0].score === 3 ||
      this.lobby.players[1].score === 3
    ) {
      clearInterval(this.gameInterval);
      this.sendPosition();
      if (this.lobby.players[0].score === 3)
        this.gameVictory(this.lobby.players[0]);
      else this.gameVictory(this.lobby.players[1]);
      return;
    }

    this.sendPosition();
  }

  randomDirection() {
    const randomAngle = Math.random() * (2 * 70) - 70;
    const angle = (randomAngle * Math.PI) / 180;
    const initialSide = Math.random() < 0.5 ? -1 : 1;

    this.ballSpeedX = initialSide * Math.cos(angle) * this.ballSpeed;
    this.ballSpeedY = Math.sin(angle) * this.ballSpeed;
  }

  sendPosition() {
    const payload: GameInfo = {
      barLeftY: this.barLeftY,
      barRightY: this.barRightY,
      barHeight: this.barHeight,
      barWidth: this.barWidth,
      ballX: this.ballX,
      ballY: this.ballY,
      ballRadius: this.ballRadius,
      playerLeft: {
        nickName: this.lobby.players[0].nickName,
        avatar: this.lobby.players[0].avatar,
        score: this.lobby.players[0].score,
      },
      playerRight: {
        nickName: this.lobby.players[1].nickName,
        avatar: this.lobby.players[1].avatar,
        score: this.lobby.players[1].score,
      },
    };
    this.lobby.sendGameEventToAll('interval', payload);
  }

  public startGame() {
    this.gameInterval = setInterval(() => {
      this.moveBall();
    }, 20);
  }

  public pressButton(player: PlayerInfo, button: string): void {
    if (this.lobby.players.length === 2) {
      if (
        player === this.lobby.players[1] &&
        button == 'ArrowUp' &&
        this.barRightY - this.barSpeed >= 0
      )
        this.barRightY -= this.barSpeed;
      else if (
        player === this.lobby.players[0] &&
        button == 'ArrowUp' &&
        this.barLeftY - this.barSpeed >= 0
      )
        this.barLeftY -= this.barSpeed;
      else if (
        player === this.lobby.players[1] &&
        button == 'ArrowDown' &&
        this.barRightY + this.barHeight + this.barSpeed <= 400
      )
        this.barRightY += this.barSpeed;
      else if (
        player === this.lobby.players[0] &&
        button == 'ArrowDown' &&
        this.barLeftY + this.barHeight + this.barSpeed <= 400
      )
        this.barLeftY += this.barSpeed;
      if (this.lobby.state === gameState.playing) this.moveBall();
    }
  }

  public stopGame(): void {
    clearInterval(this.gameInterval);
    this.lobby.sendMessageToAll('stopGame', null);
    this.lobby.lobbyManager.destroyLobby(this.lobby);
  }

  public printResult(winner: string): void {
    this.lobby.sendMessageToAll('gameMessage', `${winner} has won the match!`);
  }

  public gameVictory(player: PlayerInfo): void {
    const tournois = this.lobby.lobbyManager.findTournamentByPlayer(player);

    this.lobby.sendMessageToAll('endMatch', null);
    clearInterval(this.gameInterval);
    this.printResult(player.nickName);

    this.lobby.state = gameState.finish;

    if (tournois) tournois.handleVictory(player);
    else if (!tournois) this.lobby.sendGameResult(player);
    this.lobby.lobbyManager.destroyLobby(this.lobby);
  }
}
