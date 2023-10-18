import { Component } from '@angular/core';
import { io } from "socket.io-client";
import { WS_GATEWAY } from '../env';
import { CookiesService } from '../services/cookies.service';
import { JwtService } from '../services/jwt.service';
import { JWT_PAYLOAD } from '../services/jwt.const';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor(private readonly cookieService: CookiesService,
    private readonly jwtService: JwtService){}

  ngOnInit() {
    const [ type, token] = this.cookieService.getCookie('authorization')?.split(
      this.cookieService.getCookie('authorization')?.includes('%20') ? '%20' : ' '
    ) ?? [];

    console.log(type, token);
  
    // get client username from JWT token
    const { nickName } = JSON.parse(this.jwtService.decode(token)[JWT_PAYLOAD]);

    // Pass the username when connecting to the gateway
    const socket = io(WS_GATEWAY, { query: {"username": nickName} });

    socket.emit('message', 'hello world !');

    const name: string = 'salut';
    const test = { test: name, aurevoir: name}
    console.log(test);
    console.table(test);

    socket.on('response', (msg) => {
      const { sub, login, nickName } = JSON.parse(this.jwtService.decode(token)[JWT_PAYLOAD]);
      console.log(sub, login, nickName);
      console.log(`${nickName}: ${msg}`);
    })
  }
}
