import { Injectable } from '@angular/core';
import { CookiesService } from '../services/cookies.service';
import { JwtService } from '../services/jwt.service';
import { JWTPayload, UserSanitizeInterface } from '../interfaces/user.interface';
import {gameInvitationPayload } from '../interfaces/game.interface';
import { WS_GATEWAY } from '../env';
import { io } from 'socket.io-client';
import { JWT_PAYLOAD } from '../services/jwt.const';
import { WsClient } from './websocket.type';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameInvitationComponent } from '../modals/game-invitation/game-invitation.component';
import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public client: any
 
  constructor(private readonly cookieService: CookiesService,
    private readonly jwtService: JwtService, private modalService: NgbModal, private notif: NotificationsService) 
  {

      const AuthUser: UserSanitizeInterface | null = this.getUserInformation();

      if (!AuthUser) {
        console.error('You are not connected !')
        return ;
      }
      
      this.client = <WsClient>io(WS_GATEWAY);

      this.client.emit('join', JSON.stringify(AuthUser));

      this.client.on('newArrival', (msg: string) => {
        console.log(msg);
      })

      this.client.on('gameInvitation', (payload: gameInvitationPayload) => {
        this.openModal(payload);
        console.log("game invitation id :", payload.gameId, "; host : ", payload.host);
      });

      this.client.on('declined', () => {
        this.notif.error('Game invitation has been declined');
      })
  
      this.client.on('disconnect', (msg: string) => {
        console.log(msg);
      })
  } 

  openModal(payload: gameInvitationPayload) {
    const modalRef = this.modalService.open(GameInvitationComponent, {
      backdrop: 'static',
      keyboard: false,
    });
    console.log('Modal Reference:', modalRef);
    modalRef.componentInstance.invitation = payload.gameId;
    modalRef.componentInstance.host = payload.host;
    modalRef.componentInstance.hostAvatar = payload.hostAvatar;
  }

  initializeWebsocketService() {
    console.log('Websocket service was initialized !');
  }

  getClient(): WsClient { return (this.client); }

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
}
