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
  showContent: boolean = true;

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

  refreshList() {
    //this.approvedFriends = [];
    let tmpApproved: UserFriendsInfo[] = [];
    //this.pendingFriends = [];
    let tmpPending: UserFriendsInfo[] = [];

    if (this.friendList.length === 0)
      return ;

    this.friendList.forEach((element) => {
        if (element.status === false) {
          tmpPending.push(element);
        }
        else
        tmpApproved.push(element);
      });
      this.pendingFriends = tmpPending;
      this.approvedFriends = tmpApproved;
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
        this.client.emit('updateFriend', user);
      })
    });
  }

  //delete a friend in the friends lists, then refresh the array of friends with the removed element
  deleteFriends(user: UserFriendsInfo) {

    this.requestsService.listFriends(false)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((friends) => {
      if (!(friends.find((el) => el.user2 === user.id)))
        return;
        this.requestsService.deleteFriends(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(() => {
          this.approvedFriends = this.approvedFriends.filter((element) => {
            return element !== user
          });
          this.pendingFriends = this.pendingFriends.filter((element) => {
            return element !== user
          });
          this.client.emit('updateFriend', user);
        });
    });
  }

  blockFriends(user: UserFriendsInfo) {
    this.requestsService.listFriends(false)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((friends) => {
      if (!(friends.find((el) => el.user2 === user.id)))
        return;
      this.requestsService.blockUser(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(() => {
        this.approvedFriends = this.approvedFriends.filter((element) => {
          return element !== user
        });
        this.pendingFriends = this.pendingFriends.filter((element) => {
          return element !== user
        });
      });
      this.requestsService.deleteFriends(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(()=> {
        this.client.emit('updateFriend', user);
      });
    });
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }

  toggleOption(user: UserFriendsInfo) {
    user.showOpt = !user.showOpt;
  }

  printUser(user: UserFriendsInfo)
   {
    console.log("dansle ngfor", user);
   }

  truncateText(user: UserFriendsInfo, limit: number): string {
   // console.log(user);
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