import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { UserFriendsInfo } from '../interfaces/user.interface';
import { NavigationEnd, Router } from '@angular/router'
import { Subject, Subscription, takeUntil } from 'rxjs';
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

  test = new Subscription();
  showContent: boolean = true;
  display: boolean = true;

  ngOnInit() {
    //Display this component only on the /home page
    this.router.events.pipe(takeUntil(this.unsubscribeObs)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if ((event.url !== '/home'))
          this.display = false;
        else
          this.display = true;
      }
    });

    this.client.emit('listFriends');

    this.client.on('getListFriends', (payload: UserFriendsInfo[]) => {
      this.friendList = payload;
      if (!this.friendList)
        return ;
      this.refreshList();
    })

    this.client.on('getStatus', (payload: UserFriendsInfo[]) => {
      console.log("lala")
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
    this.approvedFriends = [];
    this.pendingFriends = [];

    if (!this.friendList)
      return ;

    this.friendList.forEach((element) => {
        if (element.status === false && element.applicant === false) {
          this.pendingFriends.push(element);
        }
        else
          this.approvedFriends.push(element);
      });
      this.client.emit('refreshStatus');
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
      this.requestsService.deleteFriends(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe();
    });
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }

  toggleOption(user: UserFriendsInfo) {
    user.showOpt = !user.showOpt;
    this.ngOnDestroy();
  }

  ngOnDestroy()
  {
    this.client.off('getStatus');
    this.client.off('getLisFriends');
    this.unsubscribeObs.next();
    this.unsubscribeObs.complete();
  }
}