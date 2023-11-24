import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subject, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from '@angular/router';
import { GameInfo } from '../interfaces/game.interface';
import { RequestsService } from '../services/requests.service';

export interface Player {
  nickName: string,
  avatar: string,
  score: number
}

@Component({
  selector: 'app-remote-game',
  templateUrl: './remote-game.component.html',
  styleUrls: ['./remote-game.component.scss']
})

export class RemoteGameComponent implements OnDestroy, OnInit {

  client: WsClient = this.ws.getClient();
  mode: string = '' ;
  playerRight = {} as Player;
  playerLeft = {} as Player;
  gameStart: boolean = false;

  @ViewChild('gameCanvasRemote', {static: true}) canvas!: ElementRef;
  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(private readonly ws: WebsocketService, private readonly route: ActivatedRoute, private readonly router: Router, private readonly requestsService: RequestsService) {
    this.route.queryParams
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(params => {
      this.mode = params['mode'];
    });

    console.log("constructor");
  }

  ngOnInit(): void {
    console.log("init");

    this.drawWaiting();
    this.client.on('gameMessage', (data: string) => {
      console.log(data);
      this.gameStart = false;
    })

    this.client.on('sendTimer', (count: number) => {
      this.printTiming(count);
    })

    this.client.on('interval', (payload: GameInfo) => {
      if(!this.gameStart){
        this.gameStart = true;
        this.playerRight.nickName = payload.playerRight.nickName;
        this.playerLeft.nickName = payload.playerLeft.nickName;
        this.playerRight.avatar = payload.playerRight.avatar;
        this.playerLeft.avatar = payload.playerLeft.avatar;
      }
      this.drawElements(payload);
    });

    this.client.on('stopGame', () => {
      console.log("Game has stopped for because your opponent has give up the match");
    });
  }

  public receiveDrawInfo(payload: GameInfo)
  {
    if(!this.gameStart){
      this.gameStart = true;
      this.playerRight.nickName = payload.playerRight.nickName;
      this.playerLeft.nickName = payload.playerLeft.nickName;
      this.playerRight.avatar = payload.playerRight.avatar;
      this.playerLeft.avatar = payload.playerLeft.avatar;
    }
    this.drawElements(payload);
  }

  //envoie le bouton sur leaquel le joueur a appuyer
  pressButton(button: string): void {
    this.ws.pressButton(this.client, button);
  }

  @HostListener('window:keydown', ['$event'])
  remoteKeyEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.pressButton(event.key);
    } else if (event.key === 'ArrowDown') {
      this.pressButton(event.key);
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

  drawElements(payload: GameInfo): void {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    const centerX: number = canvas.width / 2;

    this.playerLeft.score = payload.playerLeft.score as number;
    this.playerRight.score = payload.playerRight.score as number;

    payload.barLeftY = payload.barLeftY * this.canvas.nativeElement.width / 800;
    payload.barRightY = payload.barRightY * this.canvas.nativeElement.width / 800;
    payload.barHeight = payload.barHeight * this.canvas.nativeElement.height / 400;
    payload.barWidth = payload.barWidth * this.canvas.nativeElement.width / 800;
  
    payload.ballX =  payload.ballX * this.canvas.nativeElement.height / 400;
    payload.ballY = payload.ballY * this.canvas.nativeElement.width / 800;
    payload.ballRadius = payload.ballRadius * this.canvas.nativeElement.height / 400;

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      //Draw rackets
      context.fillStyle = 'white';
      context.fillRect(40, payload.barLeftY, payload.barWidth, payload.barHeight); //draw left bar
      context.fillRect(800 - (40 + payload.barWidth), payload.barRightY, payload.barWidth, payload.barHeight); //draw right bar

      //draw the center line
      context.strokeStyle = 'white';
      context.setLineDash([20, 15]);  //Height and space between lines
      context.lineWidth = 2;  //Width of the line
      context.beginPath();
      context.moveTo(centerX, 0);
      context.lineTo(centerX, 400);
      context.stroke();

      //draw the ball
      context.fillStyle = 'white';
      context.fillRect(payload.ballX, payload.ballY, payload.ballRadius, payload.ballRadius);

      //draw scores
      context.fillStyle = 'white';
      context.font = '80px Courier New, monospace';
      context.fillText(`${this.playerLeft.score}`, centerX / 2, 100);
      context.fillText(`${this.playerRight.score}`, 3 * (this.canvas.nativeElement.width / 4), 100);

      //Win message
      if (this.playerRight.score == 3) {
        this.gameStart = false;
        console.log("this.playerRight.score", this.playerRight.score)
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
      } else if (this.playerLeft.score == 3) {
        this.gameStart = false;
        console.log("this.playerLeft.score", this.playerLeft.score)
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
      }
    }
  }

  drawWaiting(): void{
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    const centerX: number = this.canvas.nativeElement.width / 2;

    if (context) {
      context.fillStyle = 'white';
      context.font = '50px Courier New, monospace';
      context.fillText('Waiting for opponent', (centerX / 2) - 100, 200);
      context.fillText('...', (centerX / 2) + 160, 280);
    }
  }

  printTiming(i: number){
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height); 
      context.fillStyle = 'white';
      context.font = '50px Courier New, monospace';
      context.textBaseline = 'middle';
      context.textAlign = "center";
      context.fillText(`${i}`, (canvas.width / 2), canvas.height / 2);
    }
  }

  public cancel(): void
  {
    this.client.emit('quitLobby');
    this.router.navigate(['/game-menu'])
  }

  ngOnDestroy() {
    this.client.off('interval');
    this.client.off('gameMessage');
    this.client.off('stopGame');
    this.client.off('sendTimer');
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}