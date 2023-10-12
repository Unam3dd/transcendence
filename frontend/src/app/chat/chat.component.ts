import { Component } from '@angular/core';
import { io } from "socket.io-client";
import { WS_GATEWAY } from "../env";
import { CookiesService } from '../services/cookies.service';
import { JwtService } from '../services/jwt.service';
import { JWT_PAYLOAD } from '../services/jwt.const';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  constructor(private readonly cookieService: CookiesService,
    private readonly jwtService: JwtService) {}


  ngOnInit() {
    const [ type, token] = this.cookieService.getCookie('authorization').split('%20') ?? [];
  
    const { nickName } = JSON.parse(this.jwtService.decode(token)[JWT_PAYLOAD]);

    const socket = io(WS_GATEWAY, {
      query: {
        "username": nickName
      }
    });

    socket.emit('message', 'hello world !');

    socket.on('response', (msg) => {
      const { sub, login, nickName } = JSON.parse(this.jwtService.decode(token)[JWT_PAYLOAD]);
      console.log(sub, login, nickName);
      console.log(`${nickName}: ${msg}`);
    })
  }
}
