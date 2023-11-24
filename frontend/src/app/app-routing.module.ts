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
import { RemoteGameComponent } from './remote-game/remote-game.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { loginGuard, routeGuard } from './route.guard';

const routes: Routes = [
  {path: '', component: ConnectionComponent, canActivate:[loginGuard]},
  {path: 'home', component: HomePageComponent, canActivate:[routeGuard],},
  {path: 'profile', component: ProfilePageComponent, canActivate:[routeGuard],},
  {path: 'game-menu', component: GameMenuComponent, canActivate:[routeGuard],},
  {path: 'game', component: GamePageComponent, canActivate:[routeGuard],},
  {path: 'game/remote', component: RemoteGameComponent, canActivate:[routeGuard],},
  {path: 'chat', component: ChatPageComponent, canActivate:[routeGuard],},
  {path: 'user/:userId', component: UserComponent, canActivate:[routeGuard],},
  {path: 'register', component: RegisterComponent, canActivate:[loginGuard]},
  {path: '**', component: NotFoundComponent, canActivate:[routeGuard],},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }