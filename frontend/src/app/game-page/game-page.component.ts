import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subject, takeUntil} from "rxjs";
import { RequestsService } from '../services/requests.service';

enum GameMode {
  SOLO = 'solo',
  LOCAL = 'local',
  REMOTE = 'remote',
  TOURNAMENT_LOCAL = 'tournament_local',
  TOURNAMENT_REMOTE = 'tournament_remote'
}

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})

export class GamePageComponent implements AfterViewInit, OnDestroy {

  client: WsClient = this.ws.getClient();
  userLogin: string = '';
  display: boolean = false;

  @ViewChild('gameCanvas', {static: true}) canvas!: ElementRef;
  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute, private readonly ws: WebsocketService, private readonly requestService: RequestsService) {
    //change the game mode with the button return in the game menu
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(params => {
      const mode = params['mode'];

      if (mode === GameMode.SOLO) {
        this.gameMode = GameMode.SOLO;
      } else if (mode === GameMode.LOCAL) {
        this.gameMode = GameMode.LOCAL;
      } else if (mode === GameMode.REMOTE) {
        this.gameMode = GameMode.REMOTE;
      } else if (mode === GameMode.TOURNAMENT_LOCAL) {
        this.gameMode = GameMode.TOURNAMENT_LOCAL;
      } else if (mode === GameMode.TOURNAMENT_REMOTE) {
        this.gameMode = GameMode.TOURNAMENT_REMOTE;
      }
    })
 
    this.requestService.getLoggedUserInformation()?.subscribe((data) => {
      this.userLogin = data.login as string;
    });

    this.client.on('gameMessage', (data) => {
      console.log(data);
    })

    this.client.on('display', () => {
      this.launchGame();
    })
/*
    this.client.on('endGame', () => {
      console.log("Game has finished");
      this.display = false;
    });
*/

    this.client.on('playerMoveUp', (payload) => {
      if (payload === this.userLogin)
        this.barRightY -= this.barSpeed;
      if (payload !== this.userLogin)
        this.barLeftY -= this.barSpeed;
    });

    this.client.on('playerMoveDown', (payload) => {
      console.log(payload);
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

  //Score variables
  scoreP1: number = 0;
  scoreP2: number = 0;

  //This variable checks whether the game is running
  gameStart: boolean = false;

  //Game mode variable
  gameMode!: GameMode;

  //init game
  ngAfterViewInit() {
    this.adjustCanvasDPI();
    this.initPosition();
    this.randomDirection();
    this.drawElements();
  }

  //Key management
  @HostListener('window:keydown', ['$event'])
  localKeyEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' && this.barRightY - this.barSpeed >= 0) {
      this.barRightY -= this.barSpeed;
    } else if (event.key === 'ArrowDown' && this.barRightY + this.barHeight + this.barSpeed <= this.canvas.nativeElement.height) {
      this.barRightY += this.barSpeed;
    } else if ((event.key === 'z' || event.key === 'Z') && this.barLeftY - this.barSpeed >= 0) {
      this.barLeftY -= this.barSpeed;
    } else if ((event.key === 's' || event.key === 'S') && this.barLeftY + this.barHeight + this.barSpeed <= this.canvas.nativeElement.height) {
      this.barLeftY += this.barSpeed;
    }
    this.drawElements();

    if (event.key === 'Enter') {
      if ((this.scoreP1 === 10 || this.scoreP2 === 10) && !this.gameStart) {
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        this.initPosition();
        this.gameStart = true;
        this.startGame();
      } else if (!this.gameStart) {
        this.gameStart = true;
        this.startGame();
      }
    }
  }

  launchGame(){
    if ((this.scoreP1 === 10 || this.scoreP2 === 10) && !this.gameStart) {
      this.scoreP1 = 0;
      this.scoreP2 = 0;
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
    //this.drawElements();
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.gameMode === GameMode.SOLO) {
      console.log('Mode solo activated');
    } else if (this.gameMode === GameMode.LOCAL) {
      this.localKeyEvent(event);
    } else if (this.gameMode === GameMode.REMOTE) {
      this.pressButton(event.key);
      //this.remoteKeyEvent(event);
    } else if (this.gameMode === GameMode.TOURNAMENT_LOCAL) {
      console.log('Mode local tournament activated');
    } else if (this.gameMode === GameMode.TOURNAMENT_REMOTE) {
      console.log('Mode remote tournament activated');
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
    const leftHit = this.ballX >= 40 && this.ballX <= 40 + this.barWidth;
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

    //stop the game
    if (this.scoreP1 === 10 || this.scoreP2 === 10) {
      clearInterval(this.gameInterval);
    }

    this.drawElements();
  }

  startGame() {
    this.gameInterval = setInterval(() => {
      this.moveBall();
    }, 20);
  }

  randomDirection() {
    const randomAngle = (Math.random() * (2 * 70)) - 70;
    const angle = randomAngle * Math.PI / 180;
    const initialSide = Math.random() < 0.5 ? -1 : 1;

    this.ballSpeedX = initialSide * Math.cos(angle) * this.ballSpeed;
    this.ballSpeedY = Math.sin(angle) * this.ballSpeed;
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
      context.fillText(`${this.scoreP1}`, centerX / 2, 100);
      context.fillText(`${this.scoreP2}`, 3 * (canvas.width / 4), 100);

      //Win message
      if (this.scoreP1 == 10) {
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
        context.fillText('Win', (centerX / 2) - 20, 200);
        this.gameStart = false;
      } else if (this.scoreP2 == 10) {
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
        context.fillText('Win', (3 * (canvas.width / 4)) - 20, 200);
        this.gameStart = false;
      }
    }
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
