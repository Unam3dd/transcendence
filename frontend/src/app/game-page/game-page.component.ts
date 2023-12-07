import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Subject, takeUntil} from "rxjs";
import { RequestsService } from '../services/requests.service';
import { LocalPlayer, PlayerResult } from '../interfaces/game.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectPlayerModalComponent } from '../modals/select-player-modal/select-player-modal.component';
import { v4 } from 'uuid';
import { NotificationsService } from 'angular2-notifications';
import { EndMatchComponent } from '../modals/end-match/end-match.component';
import { WebsocketService } from '../websocket/websocket.service';
import { Socket } from 'socket.io-client';
import { OnlineState } from '../enum/status.enum';

enum GameMode {
  SOLO = 'solo',
  LOCAL = 'local',
  TOURNAMENT_LOCAL = 'tournament_local',
}

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})

export class GamePageComponent implements AfterViewInit, OnInit, OnDestroy {

  userNickame: string = '';
  client = {} as Socket;

  gameId: string = '';
  gameSize: number = 0;

  players: LocalPlayer[] = [];
  currentMatch: LocalPlayer[] = [];
  currentRound: LocalPlayer[] = [];
  nextRound: LocalPlayer[] = [];

  printOrder: LocalPlayer[][] = [];

  matchCount: number = 0;
  roundTotal: number = 0;
  roundCount: number = 1;

  display: boolean = false;
  endDuo: boolean = false;

  @ViewChild('chooseNickname', { static: true }) chooseNicknameTemplate!: TemplateRef<any>;
  @ViewChild('gameCanvas', {static: true}) canvas!: ElementRef;
  
  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute, private router: Router, private activatedRoute: ActivatedRoute, private readonly requestsService: RequestsService, private modalService: NgbModal, private notif: NotificationsService, private readonly ws: WebsocketService,) {
    
    this.requestsService.getLoggedUserInformation()?.subscribe((data) => {
      this.userNickame = data.nickName as string;
      const player1: LocalPlayer = {
        "nickName": this.userNickame,
      }
      this.players.push(player1);
      this.router.events.subscribe( (event) => {
        if (event instanceof NavigationEnd) {
          //console.log(event.url);
          if (event.url != '/game' && !event.url.startsWith('/game?', 0))
          {
            console.log(event.url);
            this.ws.client.emit('statusChange', OnlineState.online);
          }
        }
      })
    });
  }

  ngOnInit(): void {
    console.log("Ng on init")
    this.endDuo = false;
    this.route.queryParams
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(params => {
    const mode = params['mode'];
    const size: number = params['size'];
    this.gameSize = size;

      if (mode === GameMode.SOLO) {
        this.gameMode = GameMode.SOLO;
      } else if (mode === GameMode.LOCAL) {
        this.gameSize = 2;
        this.gameMode = GameMode.LOCAL;
      } else if (mode === GameMode.TOURNAMENT_LOCAL) {
        this.gameMode = GameMode.TOURNAMENT_LOCAL;
        this.gameSize = size;
        this.selectPlayer(size);
      }
    })
  }

  showModal: boolean = false;

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
  roundStart: boolean = false;

  //Game mode variable
  gameMode!: GameMode;

  //init game
  ngAfterViewInit() {
    this.adjustCanvasDPI();
    this.initPosition();
    this.randomDirection();
    this.drawElements();
  }

  // Guest players choose their nicknames for the local tournament
  async selectPlayer(size: number) {
    for (let i: number = 1; i < size; i++)
    {
      let player = await this.openModal(i);
      while (this.players.find((el) => el.nickName === player.nickName))
      {
        this.notif.error("Nickname already taken");
        player = await this.openModal(i);
      }
      if (!player.nickName)
      {
        this.exitTournament();
        return ;
      }
      this.players.push(player)
    }
    this.launchTournament(size);
  }

   async openModal(size: number): Promise<LocalPlayer> {

    const modalRef = this.modalService.open(SelectPlayerModalComponent, {
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.number = size;

    return modalRef.result.then((result) => {
      const playerdata: LocalPlayer = {
        "nickName": result,
      }
      return playerdata;
    })
  }

/** Tournament related functions */
  exitTournament()
  {
    this.players = [];
    this.router.navigate(["/game-menu"]);
    return ;
  }

  launchTournament(size: number) {

    this.gameId = v4();

    if (this.players.length < 5) this.roundTotal = 2;
    else this.roundTotal = 3;

    this.currentRound = this.players;
    if (size % 2 != 0)
    {
      this.nextRound.push(this.currentRound[this.currentRound.length - 1]);
      this.currentRound.pop();
    }
    this.printOrder = this.makePairs(this.currentRound);
    this.roundStart = true;
    this.currentMatch.push(this.currentRound[0]);
    this.currentMatch.push(this.currentRound[1]);
    this.client = this.ws.getClient();
    this.ws.sendSystemMessage('message',`A new match between ${this.currentRound[0].nickName} and ${this.currentRound[1].nickName} will begin`);
    this.launchGame();
  }

  // just to make pair of 2 players that will fight to print fight order in the html
  makePairs(playerArray: LocalPlayer[]): LocalPlayer[][]{
    const pairArray: LocalPlayer[][] = [];
    for (let i = 0; i < playerArray.length; i++)
    {
      const pair = [playerArray[i], playerArray[i + 1]];
      pairArray.push(pair);
      i++;
    }
    return pairArray;
  }

  public nextMatch() {
    if (this.currentRound.length === 0) {
      this.launchNextRound();
    }
    else
    {
      this.currentMatch.push(this.currentRound[0]);
      this.currentMatch.push(this.currentRound[1]);
      this.launchGame();

      //send Message to chat
      this.ws.sendSystemMessage('message', `A new match between ${this.currentRound[0].nickName} and ${this.currentRound[1].nickName} will begin`);
    }
  }

  public launchNextRound() {
    this.roundCount++;
    this.roundStart = false;

    this.currentRound = this.nextRound;
    this.nextRound = [];
    if (this.currentRound.length % 2 != 0)
    {
      this.nextRound.push(this.currentRound[this.currentRound.length - 1]);
      this.currentRound.pop();
    }
    this.printOrder = this.makePairs(this.currentRound);
    this.nextRoundStart();
  }

  nextRoundStart()
  {
    let count: number = 5;
    this.printNextRound(count);
    const countInterval = setInterval(() => {
      count--;
      this.printNextRound(count);
      if (count === 0) {
        clearInterval(countInterval);
        this.roundStart = true;
        this.nextMatch();
      }
    }, 1000);
  }

  matchResult(winner: string) {
    if (this.roundCount === this.roundTotal)
    {
      this.tournamentEnd(winner);
      return;
    }
    if (winner === this.currentMatch[0].nickName)// winner is left player
      this.endMatch(this.currentMatch[1],this.currentMatch[0]);
    else // winner is right player
      this.endMatch(this.currentMatch[0],this.currentMatch[1]);
    this.currentMatch = [];
    this.nextMatch();
  }

  endMatch(looserInfo: LocalPlayer, winnerInfo: LocalPlayer) {
    this.nextRound.push(winnerInfo);
    const looser = this.currentRound.findIndex((elem) => elem.nickName === looserInfo.nickName);
    if (looser !== -1)
      this.currentRound.splice(looser, 1)
    const winner = this.currentRound.findIndex((elem) => elem.nickName === winnerInfo.nickName);
    if (winner !== -1)
      this.currentRound.splice(winner, 1)
  }

  tournamentEnd(winner: string)
  {
    if (winner === this.userNickame)
      this.pushGameResult(true);
    else
      this.pushGameResult(false);
    this.ws.client.emit('statusChange', OnlineState.online);
    const modalRef = this.modalService.open(EndMatchComponent, {
        backdrop: 'static',
        keyboard: false,
    });
    modalRef.componentInstance.result = true;
    modalRef.componentInstance.local = true;
    modalRef.componentInstance.winner = winner;
    return ;
  }

  pushGameResult(victory: boolean): void {
    const playerInfo: PlayerResult = {
      lobby: this.gameId,
      size: +this.gameSize,
      victory: victory,
      local: true,
    }
    this.requestsService.addGameResult(playerInfo)?.subscribe();
  }

/** Game related functions */

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

    if (event.key === 'Enter' && this.endDuo === false) {
      if ((this.scoreP1 === 3 || this.scoreP2 === 3) && !this.gameStart) {
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        this.initPosition();
        this.gameStart = true;
        this.startGame();
      } else if (!this.gameStart) {
        this.gameId = v4();
        this.gameStart = true;
        this.startGame();
      }
    }
    //this.drawElements();
  }

  launchGame(){
    if ((this.scoreP1 === 3 || this.scoreP2 === 3) && !this.gameStart) {
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
  keyEvent(event: KeyboardEvent) {
    if (this.gameMode === GameMode.SOLO) {
      this.localKeyEvent(event);
    } else if (this.gameMode === GameMode.LOCAL) {
      this.localKeyEvent(event);
    } else if (this.gameMode === GameMode.TOURNAMENT_LOCAL && this.gameStart) {
      this.localKeyEvent(event);
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
    if (this.scoreP1 === 3 || this.scoreP2 === 3) {
      clearInterval(this.gameInterval);
    }
    this.drawElements();
  }

  startGame() {
    let count: number = 3;
    this.printTiming(count);
    const countInterval = setInterval(() => {
      count--;
      this.printTiming(count);
      if (count === 0) {
        clearInterval(countInterval);
        this.gameInterval = setInterval(() => {
          this.moveBall();
        }, 20);
      }
    }, 1000);
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
      if (this.scoreP1 == 3) {
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
        this.gameStart = false;
        if (this.gameMode === GameMode.TOURNAMENT_LOCAL)
          this.matchResult(this.currentMatch[0].nickName);
        else
          this.gameReset(true);

      } else if (this.scoreP2 == 3) {
        context.fillStyle = 'white';
        context.font = '80px Courier New, monospace';
        this.gameStart = false;
        if (this.gameMode === GameMode.TOURNAMENT_LOCAL)
          this.matchResult(this.currentMatch[1].nickName);
        else
          this.gameReset(false);
      }
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

  printNextRound(count: number)
  {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'white';
      context.font = '50px Courier New, monospace';
      context.textBaseline = 'middle';
      context.fillText('Next Round in', (canvas.width / 2), (canvas.height / 2) - canvas.height * 0.2);
      context.fillText(`${count}`, (canvas.width / 2), (canvas.height / 2) + canvas.height * 0.1);
    }
  }

  gameReset(victory: boolean)
  {
    this.endDuo = true;
    const modalRef = this.modalService.open(EndMatchComponent, {
        backdrop: 'static',
        keyboard: false,
    });
    modalRef.componentInstance.result = true;
    modalRef.componentInstance.local = true;
    if (victory === true)
      modalRef.componentInstance.winner = this.userNickame;
    else
      modalRef.componentInstance.winner = "Guest";

    this.scoreP2 = 0;
    this.scoreP1 = 0;
    clearInterval(this.gameInterval);
    this.ws.changeStatus(this.ws.getClient(), OnlineState.online);
    this.pushGameResult(victory);
  }

  //Destructor
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.scoreP1 = 0;
    this.scoreP2 = 0;
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    window.location.reload();
  }
}
