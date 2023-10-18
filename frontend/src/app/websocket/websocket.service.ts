import { Injectable } from '@angular/core';
import { CookiesService } from '../services/cookies.service';
import { JwtService } from '../services/jwt.service';
import { JWTPayload } from '../interfaces/user.interface';
import { UserInformation } from '../interfaces/user.interface';
import { WS_GATEWAY } from '../env';
import { io } from 'socket.io-client';
import { JWT_PAYLOAD } from '../services/jwt.const';
import { WsClient } from './websocket.type';
import { TokenInterface } from '../interfaces/token.interface';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public client: any

  constructor(private readonly cookieService: CookiesService,
    private readonly jwtService: JwtService) {

      const AuthUser: UserInformation | null = this.getUserInformation();

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

    getUserInformation(): UserInformation | null {
      const Token: TokenInterface | null = this.cookieService.getToken();
  
      if (!Token || Token?.type != 'Bearer') return (null);

      // get client username from JWT token
      const payloadJWT = <JWTPayload>JSON.parse(this.jwtService.decode(Token.token)[JWT_PAYLOAD]);
      
      const AuthorUser: UserInformation = {
        id: payloadJWT.sub,
        login: payloadJWT.login,
        nickName: payloadJWT.nickName
      }

      return (AuthorUser);
    }
}
