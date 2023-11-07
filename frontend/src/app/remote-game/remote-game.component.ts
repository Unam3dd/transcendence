import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import { Subject } from "rxjs";
import { RequestsService } from '../services/requests.service';

export interface Player {
  login: string,
  score: number
}

@Component({
  selector: 'app-remote-game',
  templateUrl: './remote-game.component.html',
  styleUrls: ['./remote-game.component.scss']
})

export class RemoteGameComponent implements AfterViewInit, OnDestroy {

  client: WsClient = this.ws.getClient();
  userLogin: string = '';
  playerRight = {} as Player;
  playerLeft = {} as Player;

  @ViewChild('gameCanvas', {static: true}) canvas!: ElementRef;
  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(private readonly ws: WebsocketService, private readonly requestService: RequestsService) {
    this.requestService.getLoggedUserInformation()?.subscribe((user) => {
      this.userLogin = user.login as string;
    });
    //change the game mode with the button return in the game menu
    this.playerRight.score = 0;
    this.playerLeft.score = 0;
    this.client.on('gameMessage', (data) => {
      console.log(data);
    })

    this.client.on('startGame', (players) => {
        this.playerRight.login = players.p1;
        this.playerLeft.login = players.p2;
      this.launchGame();
    })

    this.client.on('endGame', () => {
      console.log("Game has finished");
      //Gerer les deconnection et les redirs de fin de match ici
    });

    this.client.on('playerMoveUp', (payload) => {
      if (payload === this.playerRight.login && this.barRightY - this.barSpeed >= 0)
        this.barRightY -= this.barSpeed;
      if (payload === this.playerLeft.login && this.barLeftY - this.barSpeed >= 0)
        this.barLeftY -= this.barSpeed;
    });

    this.client.on('playerMoveDown', (payload) => {
      if (payload === this.playerRight.login && this.barRightY + this.barHeight + this.barSpeed <= this.canvas.nativeElement.height)
      this.barRightY += this.barSpeed;
    if (payload === this.playerLeft.login && this.barLeftY + this.barHeight + this.barSpeed <= this.canvas.nativeElement.height)
      this.barLeftY += this.barSpeed;
    });

    this.client.on('randomDir', (payload) => {
      this.ballSpeedX = payload.ballSpeedX;
      this.ballSpeedY = payload.ballSpeedY;
    });
  }

  //envoie le bouton sur leaquel le joueur a appuyer
  pressButton(button: string): void {
    this.ws.pressButton(this.client, button);
  }

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
  gameInterval: number = 0;

  //This variable checks whether the game is running
  gameStart: boolean = false;

  //init game
  ngAfterViewInit() {
    this.adjustCanvasDPI();
    this.initPosition();
    this.drawElements();
  }

  launchGame(){
    if ((this.playerRight.score === 3 || this.playerLeft.score === 3) && !this.gameStart) {
      this.initPosition();
      this.gameStart = true;
      this.startGame();
    } else if (!this.gameStart) {
      this.gameStart = true;
      this.startGame();
    }
  }

  @HostListener('window:keydown', ['$event'])
  remoteKeyEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.pressButton(event.key);
    } else if (event.key === 'ArrowDown') {
      this.pressButton(event.key);
    }
    this.drawElements();
  }

  //Adjust DPI in the canvas
  adjustCanvasDPI() {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    const scale = window.devicePixelRatio;

    canvas.width = 800 * scale;
    canvas.height = 400 *scale;

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
    const leftHit = this.ballX >= 40 && this.ballX <= 40 + this.barWidth;
    const rightHit = this.ballX + this.ballRadius <= this.canvas.nativeElement.width - 40 && this.ballX + this.ballRadius >= this.canvas.nativeElement.width - 40 - this.barWidth;

    if ((leftHit && this.ballY >= this.barLeftY && this.ballY <= this.barLeftY + this.barHeight) ||
        (rightHit && this.ballY >= this.barRightY && this.ballY <= this.barRightY + this.barHeight)) {
      this.ballSpeedX = -this.ballSpeedX;
    }

    //increment players score
    if (this.ballX + this.ballRadius >= this.canvas.nativeElement.width){
      this.playerLeft.score++;
      console.log(`game is over ${this.playerLeft.login} scored`);
      clearInterval(this.gameInterval)
      this.initPosition();
      this.startGame();
    } else if (this.ballX - this.ballRadius <= 0) {

      this.playerRight.score++;
      console.log(`game is over ${this.playerRight.login} scored`);
      clearInterval(this.gameInterval)
      this.initPosition();
      this.startGame();
    }

    //reset ball position
    if (this.ballX + this.ballRadius >= this.canvas.nativeElement.width || this.ballX - this.ballRadius <= 0) {
      const centerX: number = (this.canvas.nativeElement.width - this.ballRadius) / 2;
      const centerBallY: number = (this.canvas.nativeElement.height - this.ballRadius) / 2;
      this.ballX = centerX;
      this.ballY = centerBallY;
    }

    //stop the game
    if (this.playerRight.score === 3) {
      if (this.playerRight.login === this.userLogin)
        this.client.emit('winGame');
      clearInterval(this.gameInterval);
    }
    if (this.playerLeft.score === 3){
      if (this.playerLeft.login === this.userLogin)
        this.client.emit('winGame');
      clearInterval(this.gameInterval);
    }
    this.drawElements();
  }

  startGame() {
    this.client.emit('randomDir', this.ballSpeed);
    this.gameInterval = setInterval(() => {
      this.moveBall();
    }, 20);
  }

  drawElements() {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    const centerX: number = canvas.width / 2;

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
      context.moveTo(centerX, 0);
      context.lineTo(centerX, canvas.height);
      context.stroke();

      //draw the ball
      context.fillStyle = 'white';
      context.fillRect(this.ballX, this.ballY, this.ballRadius, this.ballRadius);

      //draw scores
      context.fillStyle = 'white';
      context.font = '80px Courier New, monospace';
      context.fillText(`${this.playerLeft.score}`, centerX / 2, 100);
      context.fillText(`${this.playerRight.score}`, 3 * (canvas.width / 4), 100);

      //Win message
      if (this.playerLeft.score == 3) {
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
        context.fillText('Win', (centerX / 2) - 20, 200);
        this.gameStart = false;
        setTimeout(() => {
          window.location.href = '/game-menu';},
        3000 );
      } else if (this.playerRight.score == 3) {
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
        context.fillText('Win', (3 * (canvas.width / 4)) - 20, 200);
        this.gameStart = false;
        setTimeout(() => {
          window.location.href = '/game-menu';},
        3000 );
      }
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
      window.location.href = '/game-menu';
  }

  //Destructor
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
  }
}