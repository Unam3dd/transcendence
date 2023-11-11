import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ConnectionComponent} from "./connection/connection.component";
import {HomePageComponent} from "./home-page/home-page.component";
import {ProfilePageComponent} from "./profile-page/profile-page.component";
import {GamePageComponent} from "./game-page/game-page.component";
import { ChatPageComponent } from './chat-page/chat-page.component';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import {GameMenuComponent} from "./game-menu/game-menu.component";
import { A2fComponent } from './a2f/a2f.component';

const routes: Routes = [
  {path: '', component: ConnectionComponent},
  {path: 'home', component: HomePageComponent},
  {path: 'profile', component: ProfilePageComponent},
  {path: 'game-menu', component: GameMenuComponent},
  {path: 'game', component: GamePageComponent},
  {path: 'chat', component: ChatPageComponent},
  {path: 'user/:userId', component: UserComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'a2f', component: A2fComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
