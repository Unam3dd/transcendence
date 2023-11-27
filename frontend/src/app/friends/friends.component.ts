import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { UserFriendsInfo, UserInterface, UserUpdateStatus } from '../interfaces/user.interface';
import { NavigationEnd, Router } from '@angular/router'
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { WsClient } from '../websocket/websocket.type';
import { WebsocketService } from '../websocket/websocket.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})

export class FriendsComponent implements OnInit {

  constructor(private readonly requestsService: RequestsService, private readonly router: Router, private readonly ws:WebsocketService) {}

  client: WsClient = this.ws.getClient();

  friendList: UserFriendsInfo[] = [];
  approvedFriends: UserFriendsInfo[] = [];
  pendingFriends: UserFriendsInfo[] = [];

  unsubscribeObs = new Subject<void>();
  userData$!: Observable<UserInterface> | null;

  test = new Subscription();
  showContent: boolean = false;

  ngOnInit() {

    this.userData$ = this.requestsService.getLoggedUserInformation();
    if (!this.userData$)
      return ;

    this.userData$.pipe(takeUntil(this.unsubscribeObs)).subscribe( (user) => {
      this.client.emit('listFriends', user.id);
    });

    this.client.on('getListFriends', (payload: UserFriendsInfo[]) => {
      this.friendList = [];
      this.friendList = payload;
      if (!this.friendList)
        return ;
      this.refreshList();
    })


    this.client.on('getStatus', (payload: UserUpdateStatus[]) => {
      if (this.approvedFriends.length === 0)
        return ;
      for (let el of payload)
      {
        const found = this.approvedFriends.find( (user) => user.id === el.id)
        if (found)
        {
          found.onlineState = el.onlineState;
        }
      }
    });
  }

  public refreshList() {
    this.approvedFriends = [];
    this.pendingFriends = [];

    if (this.friendList.length === 0)
      return ;

    this.friendList.forEach(async (element) => {
      this.requestsService.listBlockedUser()?.pipe(takeUntil(this.unsubscribeObs)).subscribe((blocked) => {
        if (blocked.find((el) => el.user2 === element.id))
          return
        else if (element.status === false) {
          this.pendingFriends.push(element);
        }
        else
          this.approvedFriends.push(element);
      });
    });
  }

  //approve a friend request, remove user from pending array then adding the user in the approved array
  approvedFriendsRequest(user: UserFriendsInfo) {

    this.requestsService.listFriends(false)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((friends) => {
      if (!(friends.find((el) => el.user2 === user.id)))
        return;
      this.requestsService.updateFriendsStatus(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(() => {
        this.pendingFriends = this.pendingFriends.filter((element) => {
          return element !== user
        });
        this.approvedFriends.push(user);
        this.client.emit('updateFriend', user.id);
      })
    });
  }

  //delete a friend in the friends lists, then refresh the array of friends with the removed element
  deleteFriends(user: UserFriendsInfo) {

    this.requestsService.listFriends(false)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((friends) => {
      if (!(friends.find((el) => el.user2 === user.id)))
      {
        this.removeFriend(user);
        return;
      }
        
      this.requestsService.deleteFriends(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(() => {
        this.removeFriend(user);
        this.client.emit('updateFriend', user.id);
      });
    });
  }

  blockFriends(user: UserFriendsInfo) {
    this.requestsService.listFriends(false)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((friends) => {
      if (!(friends.find((el) => el.user2 === user.id)))
        return;
      this.requestsService.blockUser(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(() => {
        this.removeFriend(user);
      });
      this.requestsService.deleteFriends(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(()=> {
        this.client.emit('updateFriend', user.id);
      });
    });
  }

  removeFriend(user: UserFriendsInfo)
  {
    this.approvedFriends = this.approvedFriends.filter((element) => {
      return element !== user
    });
    this.pendingFriends = this.pendingFriends.filter((element) => {
      return element !== user
    });
  }

  toggleContent() {
    this.showContent = !this.showContent;
    if (this.showContent && this.userData$) {
      this.userData$.pipe(takeUntil(this.unsubscribeObs)).subscribe( (user) => {
        this.client.emit('listFriends', user.id);
      });
    }
  }

  toggleOption(user: UserFriendsInfo) {
    user.showOpt = !user.showOpt;
  }

  truncateText(user: UserFriendsInfo, limit: number): string {
    return user.nickName.length > limit ? user.nickName.substring(0, limit) + '...' : user.nickName;
  }

  ngOnDestroy()
  {
    this.client.off('getStatus');
    this.client.off('getLisFriends');
    this.unsubscribeObs.next();
    this.unsubscribeObs.complete();
  }
}