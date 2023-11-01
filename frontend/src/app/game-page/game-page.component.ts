import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';

enum GameMode {
  TWO_PLAYERS = 'twoPlayers',
  SOLO = 'solo'
}

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements AfterViewInit {
  @ViewChild('gameCanvas', {static: true}) canvas!: ElementRef;

  barLeftY: number = 0;
  barRightY: number = 0;
  barHeight: number = 50;
  barWidth: number = 10;
  barSpeed: number = 30;

  ballX: number = 0;
  ballY: number = 0;
  ballRadius: number = 10;
  ballSpeedX: number = 0;
  ballSpeedY: number = 0;
  ballSpeed: number = 5;

  scoreP1: number = 0;
  scoreP2: number = 0;

  gameMode: GameMode = GameMode.TWO_PLAYERS;

  ngAfterViewInit() {
    this.adjustCanvasDPI();
    this.initPosition();
    this.randomDirection();
    this.drawElements();
  }

  changeGameMode(mode: string) {
    if (mode == 'twoPlayers') {
      this.gameMode = GameMode.TWO_PLAYERS;
    } else if (mode == 'solo') {
      this.gameMode = GameMode.SOLO;
    }
  }

  //Key management
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.gameMode == GameMode.TWO_PLAYERS) {
      if (event.key === 'ArrowUp' && this.barRightY - this.barSpeed >= 0) {
        this.barRightY -= this.barSpeed;
      } else if (event.key === 'ArrowDown' && this.barRightY + this.barHeight + this.barSpeed <= this.canvas.nativeElement.height) {
        this.barRightY += this.barSpeed;
      } else if ((event.key === 'w' || event.key === 'W') && this.barLeftY - this.barSpeed >= 0) {
        this.barLeftY -= this.barSpeed;
      } else if ((event.key === 's' || event.key === 'S') && this.barLeftY + this.barHeight + this.barSpeed <= this.canvas.nativeElement.height) {
        this.barLeftY += this.barSpeed;
      }
      this.drawElements();
    } else if (this.gameMode == GameMode.SOLO) {
      console.log('Solo mode activated');
      if (event.key === 'ArrowUp') {
        this.barLeftY -= this.barSpeed;
      } else if (event.key === 'ArrowDown') {
        this.barLeftY += this.barSpeed;
      }
      this.drawElements();
    }

    if (event.key === 'Enter') {
      this.startGame();
    }
  }

  //Adjust DPI in the canvas
  adjustCanvasDPI() {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    const scale = window.devicePixelRatio;

    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight *scale;

    if (context) {
      context.scale(scale, scale);
    }
  }

  initPosition() {
    const centerY: number = (this.canvas.nativeElement.height - this.barHeight) / 2;
    const centerX: number = (this.canvas.nativeElement.width - this.ballRadius) / 2;
    const centerBallY: number = (this.canvas.nativeElement.height - this.ballRadius) / 2;

    this.barRightY = centerY;
    this.barLeftY = centerY;

    this.ballX = centerX;
    this.ballY = centerBallY;
  }

  //manage movement and hit box
  moveBall() {
    this.ballY += this.ballSpeedY;
    this.ballX += this.ballSpeedX;

    //Canvas hit box
    if (this.ballY + this.ballRadius >= this.canvas.nativeElement.height ||
      this.ballY - this.ballRadius <= 0) {
      this.ballSpeedY = -this.ballSpeedY;
    }

    //Rackets hit box
    const leftHit = this.ballX + this.ballRadius >= 40 && this.ballX + this.ballRadius <= 40 + this.barWidth;
    const rightHit = this.ballX + this.ballRadius <= this.canvas.nativeElement.width - 40 && this.ballX + this.ballRadius >= this.canvas.nativeElement.width - 40 - this.barWidth;

    if ((leftHit && this.ballY >= this.barLeftY && this.ballY <= this.barLeftY + this.barHeight) ||
        (rightHit && this.ballY >= this.barRightY && this.ballY <= this.barRightY + this.barHeight)) {
      this.ballSpeedX = -this.ballSpeedX;
    }

    //increment players score
    if (this.ballX + this.ballRadius >= this.canvas.nativeElement.width){
      this.scoreP1++;
    } else if (this.ballX - this.ballRadius <= 0) {
      this.scoreP2++;
    }

    //reset ball position
    if (this.ballX + this.ballRadius >= this.canvas.nativeElement.width || this.ballX - this.ballRadius <= 0) {
      const centerX: number = (this.canvas.nativeElement.width - this.ballRadius) / 2;
      const centerBallY: number = (this.canvas.nativeElement.height - this.ballRadius) / 2;
      this.ballX = centerX;
      this.ballY = centerBallY;
      this.randomDirection();
    }

    this.drawElements();
  }

  startGame() {
    setInterval(() => {
      this.moveBall();
    }, 20);
  }

  randomDirection() {
    const randomAngle = Math.random() * Math.PI * 2;
    this.ballSpeedX = Math.cos(randomAngle) * this.ballSpeed;
    this.ballSpeedY = Math.sin(randomAngle) * this.ballSpeed;
  }

  drawElements() {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      //Draw rackets
      context.fillStyle = 'white';
      context.fillRect(40, this.barLeftY, this.barWidth, this.barHeight); //draw left bar
      context.fillRect(canvas.width - (40 + this.barWidth), this.barRightY, this.barWidth, this.barHeight); //draw right bar

      //draw the center line
      context.strokeStyle = 'white';
      context.setLineDash([20, 15]);  //Height and space between lines
      context.lineWidth = 2;  //Width of the line

      context.beginPath();
      const centerX: number = canvas.width / 2;
      context.moveTo(centerX, 0);
      context.lineTo(centerX, canvas.height);
      context.stroke();

      //draw the ball
      context.fillStyle = 'white';
      context.fillRect(this.ballX, this.ballY, this.ballRadius, this.ballRadius)
    }
  }
}
