import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Friends } from '../interfaces/friends.interface';
import { UserFriendsInfo } from '../interfaces/user.interface';
import { NavigationEnd, Router } from '@angular/router'
import { Subject, fromEvent, takeUntil } from 'rxjs';
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

  friendsList: Friends[] = [];
  approvedFriends: UserFriendsInfo[] = [];
  pendingFriends: UserFriendsInfo[] = [];

  unsubscribeObs = new Subject<void>();
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

    this.client.on('updateFriends', () => {
      this.friendsList = [];
      console.log("heho")
      this.requestsService.listFriends(false)?.subscribe((friends) => {
        //this.friendsList = friends;
        this.createList(friends);
      });
    });

    //Get all friends, then stocks pending / approved friends in two diffrents arrays
    this.requestsService.listFriends(false)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((friends) => {
      //this.friendsList = friends;
      this.createList(friends);
    });
  }

  //Loop on each friends, then push pending into pendingFriends array or approved into approvedFriends array
  createList(friends: Friends[]) {
    this.approvedFriends = [];
    this.pendingFriends = [];

    friends.forEach((element) => {
      this.requestsService.getUserInfo(element.user2)?.pipe(takeUntil(this.unsubscribeObs)).subscribe((user) => {
        const friendsInfo: UserFriendsInfo = { 
          ...user, 
          'applicant': element.applicant,
          'showOpt': false
        }
        if (element.status === false) {
          this.pendingFriends.push(friendsInfo);
        }
        else
          this.approvedFriends.push(friendsInfo);
        });
      });
    }

  //approve a friend request, remove user from pending array then adding the user in the approved array
  approvedFriendsRequest(user: UserFriendsInfo) {
    this.requestsService.updateFriendsStatus(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(() => {
      this.pendingFriends = this.pendingFriends.filter((element) => {
        return element !== user
      });
      this.approvedFriends.push(user);
    })
    const payload = {
      "recipient": user.nickName
    }
    this.client.emit('updateFriends', payload)
    user.showOpt = !user.showOpt;
  }

  //delete a friend in the friends lists, then refresh the array of friends with the removed element
  deleteFriends(user: UserFriendsInfo) {
    this.requestsService.deleteFriends(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(() => {
      this.approvedFriends = this.approvedFriends.filter((element) => {
        return element !== user
      });
      this.pendingFriends = this.pendingFriends.filter((element) => {
        return element !== user
      });
    });
    const payload = {
      "recipient": user.nickName
    }
    this.client.emit('updateFriends', payload)
    user.showOpt = !user.showOpt;
  }

  blockFriends(user: UserFriendsInfo) {
    this.requestsService.blockUser(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe(() => {
      this.approvedFriends = this.approvedFriends.filter((element) => {
        return element !== user
      });
      this.pendingFriends = this.pendingFriends.filter((element) => {
        return element !== user
      });
    });
    this.requestsService.deleteFriends(user.id)?.pipe(takeUntil(this.unsubscribeObs)).subscribe();
    const payload = {
      "recipient": user.nickName
    }
    this.client.emit('updateFriends', payload)
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }

  toggleOption(user: UserFriendsInfo) {
    user.showOpt = !user.showOpt;
  }

  ngOnDestroy()
  {
    this.unsubscribeObs.next();
    this.unsubscribeObs.complete();
  }
}