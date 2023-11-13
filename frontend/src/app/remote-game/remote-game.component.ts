import { WebsocketService } from '../websocket/websocket.service';
import { WsClient } from '../websocket/websocket.type';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subject, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from '@angular/router';
import { GameInfo, GameParams, GameResult } from '../interfaces/game.interface';
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

  gameParams: GameParams = {id: '', size: 0};

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

    //Pas besoin ?
    this.client.on('gameId', (payload: GameParams) => {
      if (!this.gameParams.id)
      {
        console.log("Game param test");
        this.gameParams.id = payload.id;
        this.gameParams.size = payload.size
      }
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

    this.client.on('endMatch', (payload: GameResult) => {
      console.log("Game has finish because someone has won the match");
      
      /*const game: GameResult = {
        lobby: this.gameParams.id,
        //user: 
        size: this.gameParams.size,
        
      }
      this.requestsService.addGameResult(payload);*/
      //Gerer les deconnection et les redirs de fin de match ici
      //print something like victory or defeat to players?

      //redir looser to menu? 
    });
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
    canvas.width = 800;
    canvas.height = 600;

    //canvas.width = 800 * scale;
    //canvas.height = 400 * scale;

    if (context) {
      context.scale(scale, scale);
    }
  }

  drawElements(payload: GameInfo) {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    const centerX: number = 800 / 2;

    this.playerLeft.score = payload.playerLeft.score as number;
    this.playerRight.score = payload.playerRight.score as number;

    if (context) {
      context.clearRect(0, 0, 800, 400);

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
      context.fillText(`${this.playerRight.score}`, 3 * (800 / 4), 100);

      //Win message
      if (this.playerLeft.score == 3) {
        this.gameStart = false;
        console.log("this.playerLeft.score", this.playerLeft.score)
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
        context.fillText('Win', (centerX / 2) - 20, 200);
      } else if (this.playerRight.score == 3) {
        this.gameStart = false;
        console.log("this.playerRight.score", this.playerRight.score)
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
        context.fillText('Win', (3 * (800 / 4)) - 20, 200);
      }
    }
  }

  drawWaiting(){
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    const centerX: number = 800 / 2;

    if (context) {
      context.fillStyle = 'white';
      context.font = '50px Courier New, monospace';
      context.fillText('Waiting for opponent', (centerX / 2) - 100, 200);
      context.fillText('...', (centerX / 2) + 160, 280);
    }
  }

  public cancel()
  {
    this.client.emit('quitLobby');
    this.router.navigate(['/game-menu'])
  }

  ngOnDestroy() {
    console.log("ng destroy");
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}