import { Injectable } from '@angular/core';
import { CookiesService } from '../services/cookies.service';
import { JwtService } from '../services/jwt.service';
import { JWTPayload } from '../interfaces/user.interface';
import { UserInformation } from '../interfaces/user.interface';
import { Status } from '../enum/status.enum';
import { WS_GATEWAY } from '../env';
import { io } from 'socket.io-client';
import { JWT_PAYLOAD } from '../services/jwt.const';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private readonly cookieService: CookiesService,
    private readonly jwtService: JwtService) {
      const [ type, token] = this.cookieService.getCookie('authorization')?.split(
        this.cookieService.getCookie('authorization')?.includes('%20') ? '%20' : ' '
      ) ?? [];
  
      if (type != 'Bearer') {
        console.error('You are not connected !');
        return ;
      }
      
      // get client username from JWT token
      const payloadJWT = <JWTPayload>JSON.parse(this.jwtService.decode(token)[JWT_PAYLOAD]);
      
      const AuthorUser: UserInformation = {
        id: payloadJWT.sub,
        login: payloadJWT.login,
        nickName: payloadJWT.nickName,
        status: Status.ONLINE
      }
  
      // Pass the username when connecting to the gateway
      const client = io(WS_GATEWAY);

      client.emit('join', JSON.stringify(AuthorUser));

      client.on('newArrival', (msg) => {
        console.log(msg);
      })
  
      client.on('disconnect', (msg) => {
        console.log(msg);
        AuthorUser.status = Status.OFFLINE;
      })
    }

    initializeWebsocketService() {
      console.log('Websocket service was initialized !');
    }
}
