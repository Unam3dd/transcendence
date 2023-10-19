import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Friends } from '../interfaces/friends.interface';
import { UserSanitizeInterface } from '../interfaces/user.interface';
@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})

export class FriendsComponent implements OnInit {

  constructor(private readonly requestsService: RequestsService) {}

  friendsList: Friends[] = [];
  approvedFriends: UserSanitizeInterface[] = [];
  pendingFriends: UserSanitizeInterface[] = [];

  showContent: boolean = false;
  
  showOptions: boolean = false;
  showPendingOptions: boolean = false;
  toggleOptions: boolean = false;
  togglePendingOptions: boolean = false;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {

    //get all friends, then stocks pending / approved friends in two diffrents arrays
    this.requestsService.listFriends(false).subscribe((friends) => {
      this.friendsList = friends;
      this.createList();
    });
  }

  createList() {
  // Loop on each friends, then push pending into pendingFriends array or approved into approvedFriends array
    this.friendsList.forEach((element) => {
      if (element.status === false) {
        this.requestsService.getUserInfo(element.user2).subscribe((user) => {
          this.pendingFriends.push(user);
        });
      }
     else {
        this.requestsService.getUserInfo(element.user2).subscribe((user) => {
          this.approvedFriends.push(user);
        });
      }
    });
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }

  toggleOption() {
    this.showOptions = !this.showOptions;
  }

  togglePendingOption() {
    this.showPendingOptions = !this.showPendingOptions;
  }

  approvedFriendsRequest(user: UserSanitizeInterface) {
    this.requestsService.updateFriendsStatus(user.id).subscribe(() => {
      this.pendingFriends = this.pendingFriends.filter((element) => {
        return element !== user
      });
      this.approvedFriends.push(user);
    })
  }

  //delete a friend in the friends lists, then refresh the array of friends with the removed element
  deleteFriends(user: UserSanitizeInterface) {
    this.requestsService.deleteFriends(user.id).subscribe(() => {
      this.approvedFriends = this.approvedFriends.filter((element) => {
        return element !== user
      });
    });
  }

  showProfile() {

  }
  
}
