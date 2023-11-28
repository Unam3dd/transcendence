import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSanitizeInterface } from '../interfaces/user.interface';
import { RequestsService } from '../services/requests.service';
import { GameResult } from '../interfaces/game.interface';
import { Subject, takeUntil } from 'rxjs';
import { WebsocketService } from '../websocket/websocket.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  user = {} as UserSanitizeInterface;
  myId: number = 0;
  client = this.ws.getClient();
  gameHistory: GameResult[] = [];
  win: number = 0;
  loose: number = 0;
  winrate: number = 0;

  unsubscribeObs = new Subject<void>();

  constructor(private readonly route: ActivatedRoute,
    private readonly requestServices: RequestsService, private readonly router: Router, private readonly ws: WebsocketService) {}

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const userIdFromRoute = Number(routeParams.get('userId'));


    this.requestServices.getUserInfo(userIdFromRoute)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((user) => {
      this.user = user;

      this.requestServices.getLoggedUserInformation()?.pipe(takeUntil(this.unsubscribeObs)).subscribe((info) => {
        if (!info)
          return ;
        if (info.id === this.user.id)
          this.router.navigate(['/profile']);
        if (info.id)
          this.myId = info.id;
        this.requestServices.listGame(userIdFromRoute)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((games) => {
          this.gameHistory = games.reverse();
          this.dateFormat();
          this.win = this.countWin(games);
          this.loose = this.countLoose(games);
          this.winrate = ((this.win / games.length) * 100) || 0;
          this.winrate = Number(this.winrate.toFixed(2));
        });
      })
    });
  }

  dateFormat(): void {
    this.gameHistory.forEach((el) => {
      el.createdAt = el.createdAt.substring(0,10);
    })
  }

  countWin(gameList: GameResult[]): number {
    let counter: number = 0;
  
    gameList.forEach(element => {
      if (element.victory)
        counter++;
    })
    return (counter);
  }

  countLoose(gameList: GameResult[]): number{
    let counter: number = 0;
    gameList.forEach(element => {
      if (!element.victory)
        counter++;
    });
    return (counter);
  }

  public addFriends()
  {

    this.requestServices.listFriends(false)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((friends) => {
      if (friends.find((el) => el.user2 === this.user.id))
        return ;
      this.requestServices.listBlockedUser()?.pipe(takeUntil(this.unsubscribeObs)).subscribe((blocked) => {
        if (blocked.find((el) => el.user2 === this.user.id))
          return ;
        this.requestServices.addFriends(this.user.id)?.subscribe( () => {
          this.client.emit('updateFriend', this.user.id);
          this.client.emit('updateFriend', this.myId);
        });
      });
    });
  }

  ngOnDestroy()
  {
    this.unsubscribeObs.next();
    this.unsubscribeObs.complete();
  }
}