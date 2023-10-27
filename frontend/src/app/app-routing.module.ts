import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ConnectionComponent} from "./connection/connection.component";
import {HomePageComponent} from "./home-page/home-page.component";
import {ProfilePageComponent} from "./profile-page/profile-page.component";
import {GamePageComponent} from "./game-page/game-page.component";
import {ChatComponent} from "./chat/chat.component";
import { UserComponent } from './user/user.component';
import {UpdateProfileComponent} from "./update-profile/update-profile.component";

const routes: Routes = [
  {path: '', component: ConnectionComponent},
  {path: 'home', component: HomePageComponent},
  {path: 'profile', component: ProfilePageComponent},
  {path: 'profile/update', component: UpdateProfileComponent},
  {path: 'game', component: GamePageComponent},
  {path: 'chat', component: ChatComponent},
  {path: 'user/:userId', component: UserComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
