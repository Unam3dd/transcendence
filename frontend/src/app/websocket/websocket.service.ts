import { Injectable } from '@angular/core';
import { CookiesService } from '../services/cookies.service';
import { JwtService } from '../services/jwt.service';
import { JWTPayload, UserSanitizeInterface, Message, ClientInfoInterface } from '../interfaces/user.interface';
import { WS_GATEWAY } from '../env';
import { Socket, io } from 'socket.io-client';
import { JWT_PAYLOAD } from '../services/jwt.const';
import { WsClient } from './websocket.type';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public client: any

  public targetRecipient: any

  public received_messages: Message[] = [];

  constructor(private readonly cookieService: CookiesService,
    private readonly jwtService: JwtService) {
      

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
  
      this.client.on('disconnect', (msg: string) => {
        console.log(msg);
      })
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
}
