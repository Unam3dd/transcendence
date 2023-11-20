import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Friends } from '../interfaces/friends.interface';
import { UserFriendsInfo, UserSanitizeInterface } from '../interfaces/user.interface';
import { NavigationEnd, Router } from '@angular/router'
import { Subject, Subscription, shareReplay, takeUntil } from 'rxjs';
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

  friendList: Friends[] = [];
  approvedFriends: UserFriendsInfo[] = [];
  pendingFriends: UserFriendsInfo[] = [];

  unsubscribeObs = new Subject<void>();

  test = new Subscription();
  showContent: boolean = false;
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
  
    this.refreshList();
  }

  refreshList()
  {
    this.friendList = [];
    this.requestsService.listFriends(false)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((friends) => {
      this.friendList = friends;

      this.approvedFriends = [];
      this.pendingFriends = [];

      friends.forEach((element) => {
        this.requestsService.getUserInfo(element.user2)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((user) => {
          const friendsInfo: UserFriendsInfo = { 
            ...user, 
            'applicant': element.applicant,
            'showOpt': false
          }
          if (element.status === false && element.applicant === false) {
            this.pendingFriends.push(friendsInfo);
          }
          else
            this.approvedFriends.push(friendsInfo);
          });
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
    this.ngOnInit();
  }

  toggleOption(user: UserFriendsInfo) {
    user.showOpt = !user.showOpt;
    this.ngOnDestroy();
  }

  ngOnDestroy()
  {
    this.unsubscribeObs.next();
    this.unsubscribeObs.complete();
  }
}