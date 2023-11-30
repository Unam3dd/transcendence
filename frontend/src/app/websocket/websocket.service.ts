import { Injectable } from '@angular/core';
import { CookiesService } from '../services/cookies.service';
import { JwtService } from '../services/jwt.service';
import { JWTPayload, UserSanitizeInterface, Message, ClientInfoInterface } from '../interfaces/user.interface';
import { gameInvitationPayload } from '../interfaces/game.interface';
import { WS_GATEWAY } from '../env';
import { Socket, io } from 'socket.io-client';
import { JWT_PAYLOAD } from '../services/jwt.const';
import { WsClient } from './websocket.type';
import { BlockedUser } from '../interfaces/user.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameInvitationComponent } from '../modals/game-invitation/game-invitation.component';
import { NotificationsService } from 'angular2-notifications';
import { EndMatchComponent } from '../modals/end-match/end-match.component';
import { OnlineState } from '../enum/status.enum';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public client: any

  public targetRecipient: ClientInfoInterface | null = null;

  public received_messages: Message[] = [];

  public client_name: string = 'General';
  public author_name: string = '';

  public BlockUserList: BlockedUser[] = [];
 
  constructor(private readonly cookieService: CookiesService,
    private readonly jwtService: JwtService, private modalService: NgbModal, private notif: NotificationsService) 
  {

      const AuthUser: UserSanitizeInterface | null = this.getUserInformation();

      if (!AuthUser) {
        console.error('You are not connected !')
        return ;
      }
      
      this.client = <WsClient>io(WS_GATEWAY, { transports: ['websocket'], rejectUnauthorized: false });

      this.client.emit('join', JSON.stringify(AuthUser));

      this.client.on('newArrival', (msg: string) => {
        console.log(msg);
      })
  
      this.client.on('disconnect', (msg: string) => {
        console.log(msg);
      })

      /** Game related listening events */

      this.client.on('gameInvitation', (payload: gameInvitationPayload) => {
        this.openModal(payload);
        console.log("game invitation id :", payload.gameId, "; host : ", payload.host);
      });

      this.client.on('declined', () => {
        this.notif.error('Game invitation has been declined');
      });

      this.client.on('result', (payload: boolean) => {
        this.changeStatus(this.client, OnlineState.online);
        this.printGameResult(payload);
    });
  } 

  initializeWebsocketService() {
    console.log('Websocket service was initialized !');
  }

  getClient(): WsClient { return (this.client); }

  sendMessage(path: string, data: any) {
      const user: UserSanitizeInterface | null = this.getUserInformation();

      if (!user) return ;

      const client: Socket = this.getClient();

      const message: Message = {
        author: {
          ...user,
          clientID: client.id
        },
        content: data,
        createdAt: new Date(),
        recipient: this.targetRecipient
      }

      this.client.emit(path, message);
    }

    sendSystemMessage(path: string, data: string) {
      const user: UserSanitizeInterface | null = this.getUserInformation();

      if (!user) return ;

      const client: Socket = this.getClient();

      const clientInfo: ClientInfoInterface = {
        ...user,
        clientID: client.id
      }

      const message: Message = {
        author: {
          login: 'sy',
          id: 0,
          avatar: '',
          clientID: '',
          nickName: ''
        },
        content: data,
        createdAt: new Date(),
        recipient: null
      }
      this.client.emit(path, message);
    }

    listClient() {
      const client = this.getClient();

      client.emit('listClient', null);
    }

    resetAllListener() {
      const client = this.getClient();

      client.removeAllListeners();
    }

    removeListener(channel: string) {
      const client = this.getClient();
      client.removeListener(channel);
    }
  
  sendHelloChat(client: WsClient): void {
    const user = this.getUserInformation()

    if (!user) return ;

    client.emit('newJoinChat', `${user.login} (${user.nickName}) has joined a chat !`);
  }

  getUserInformation(): UserSanitizeInterface | null {
    const token: string | null = this.cookieService.getToken();
  
    if (!token) return (null);

      // get client username from JWT token
    const payloadJWT = <JWTPayload>JSON.parse(this.jwtService.decode(token)[JWT_PAYLOAD]);
      
    const AuthorUser: UserSanitizeInterface = {
      id: payloadJWT.sub,
      login: payloadJWT.login,
      nickName: payloadJWT.nickName,
      avatar: payloadJWT.avatar
    }
    return (AuthorUser);
  }

  /* Game and Matchmaking functions */

  openModal(payload: gameInvitationPayload) {
    const modalRef = this.modalService.open(GameInvitationComponent, {
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.invitation = payload.gameId;
    modalRef.componentInstance.host = payload.host;
    modalRef.componentInstance.hostAvatar = payload.hostAvatar;
  }

  privateGame(client: WsClient, opponentNickname: string) {
    const user = this.getUserInformation();

    if (!user) return ;

    const payload = {
      "nickName": user.nickName,
      "size": 2,
      "opponentNickname": opponentNickname
    }
    client.emit('privateGame', payload);
  }

  joinPrivateGame(client: WsClient, gameId: string) {

    const user = this.getUserInformation();

    if (!user) return ;
    const payload = {
      "nickName": user.nickName,
      "gameId": gameId
    }
    client.emit('joinPrivateGame', payload);
  }

  declinePrivateGame(client: WsClient, gameId: string) {

    const user = this.getUserInformation();

    if (!user) return ;
    const payload = {
      "nickName": user.nickName,
      "gameId": gameId
    }
    client.emit('declinePrivateGame', payload);
  }

  enterLobby(client: WsClient, size:number): void {
    const user = this.getUserInformation();

    if (!user) return ;

    const payload = {
      "nickName": user.nickName,
      "size": size,
    }
    this.changeStatus(this.client, OnlineState.ingame);
    client.emit('joinGame', payload);
  }

  pressButton(client: WsClient, button: string): void {

    const user = this.getUserInformation();

    if (!user) return ;

    const payload = {
      "nickName": user.nickName,
      "button": button,
    }
    client.emit('pressButton', payload);
  }

  printGameResult(victory: boolean)
  {
    const modalRef = this.modalService.open(EndMatchComponent, {
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.result = victory;
    modalRef.componentInstance.local = false;
  }

  changeStatus(client: WsClient, state: OnlineState)
  {
    client.emit('statusChange', state);
  }
  /** End remote games functions */

}
