import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ConnectionComponent } from './connection/connection.component';
import { HomePageComponent } from './home-page/home-page.component';
import { GamePageComponent } from './game-page/game-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import {HttpClientModule} from "@angular/common/http";
import { FooterComponent } from './footer/footer.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ChatComponent } from './chat/chat.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { WebsocketModule } from './websocket/websocket.module';
import { WebsocketService } from './websocket/websocket.service';
import { FriendsComponent } from './friends/friends.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { UserComponent } from './user/user.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import { RegisterComponent } from './register/register.component';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { RemoteGameComponent } from './remote-game/remote-game.component';
import { Options, SimpleNotificationsModule } from 'angular2-notifications';

const NotifcationOpt: Options = {
  position: ["top", "right"],
  showProgressBar: true,
  timeOut: 3000
}
 
function initializeWebSocket(ws: WebsocketService) {
  return async () => {
    ws.initializeWebsocketService();
    return (ws);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ConnectionComponent,
    HomePageComponent,
    GamePageComponent,
    RemoteGameComponent,
    ProfilePageComponent,
    FooterComponent,
    ChatComponent,
    FriendsComponent,
    ChatPageComponent,
    UserComponent,
    RegisterComponent,
    GameMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    WebsocketModule,
    NgbModule,
    SimpleNotificationsModule.forRoot(NotifcationOpt)
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: initializeWebSocket,
    deps: [WebsocketService],
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
