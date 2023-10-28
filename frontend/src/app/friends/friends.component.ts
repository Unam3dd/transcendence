import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Friends } from '../interfaces/friends.interface';
import { UserFriendsInfo } from '../interfaces/user.interface';
import { NavigationEnd, Router } from '@angular/router'
@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})

export class FriendsComponent implements OnInit {

  constructor(private readonly requestsService: RequestsService, private readonly router: Router) {}

  friendsList: Friends[] = [];
  approvedFriends: UserFriendsInfo[] = [];
  pendingFriends: UserFriendsInfo[] = [];

  showContent: boolean = false;
  display: boolean = true;

  ngOnInit() {
    //Display this component only on the /home page
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if ((event.url !== '/home'))
         this.display = false;
        else
        this.display = true;
      }
    });
  
    //Get all friends, then stocks pending / approved friends in two diffrents arrays
    this.requestsService.listFriends(false)?.subscribe((friends) => {
      this.friendsList = friends;
      this.createList();
    });
  }

  //Loop on each friends, then push pending into pendingFriends array or approved into approvedFriends array
  createList() {
    this.friendsList.forEach((element) => {
      if (element.status === false) {
        this.requestsService.getUserInfo(element.user2)?.subscribe((user) => {
          this.pendingFriends.push(user as UserFriendsInfo);
        });
      }
      else {
        this.requestsService.getUserInfo(element.user2)?.subscribe((user) => {
          this.approvedFriends.push(user as UserFriendsInfo);
        });
      }
    });
  }

  //approve a friend request, remove user from pending array then adding the user in the approved array
  approvedFriendsRequest(user: UserFriendsInfo) {
    this.requestsService.updateFriendsStatus(user.id)?.subscribe(() => {
      this.pendingFriends = this.pendingFriends.filter((element) => {
        return element !== user
      });
      this.approvedFriends.push(user);
    })
    user.showOpt = !user.showOpt;
  }

  //delete a friend in the friends lists, then refresh the array of friends with the removed element
  deleteFriends(user: UserFriendsInfo) {
    this.requestsService.deleteFriends(user.id)?.subscribe(() => {
      this.approvedFriends = this.approvedFriends.filter((element) => {
        return element !== user
      });
    });
    user.showOpt = !user.showOpt;
  }

  blockFriends(user: UserFriendsInfo) {
    this.requestsService.blockUser(user.id)?.subscribe(() => {
      this.approvedFriends = this.approvedFriends.filter((element) => {
        return element !== user
      });
      this.pendingFriends = this.pendingFriends.filter((element) => {
        return element !== user
      });
    });
    this.requestsService.deleteFriends(user.id)?.subscribe();
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }

  toggleOption(user: UserFriendsInfo) {
    user.showOpt = !user.showOpt;
  }
}