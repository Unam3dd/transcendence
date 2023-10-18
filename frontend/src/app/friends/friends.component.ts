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

  approvedfriendsList: Friends[] = [];
  pendingfriendsList: Friends[] = [];
  approvedFriends: UserSanitizeInterface[] = [];
  pendingFriends: UserSanitizeInterface[] = [];

  showContent: boolean = false;

  ngOnInit() {
    //get all approved friends, then stocks their infos in approvedFriends array
    this.requestsService.listFriends(true).subscribe((friends) => {
      this.approvedfriendsList = friends;
      this.createApprovedList();
    });

    //get all friends, then stocks only pending friends in pendingFriends array
    this.requestsService.listFriends(false).subscribe((friends) => {
      this.pendingfriendsList = friends;
      console.log(this.pendingfriendsList);
      this.createPendingList();
    });
  }

  createApprovedList() {
  // Loop on each approved friends, then push their users infos into approvedFriends
    this.approvedfriendsList.forEach((element) => {
      this.requestsService.getUserInfo(element.user2).subscribe((user) => {
        this.approvedFriends.push(user);
      });
    })
  }

  createPendingList() {
  // Loop on each friends, then push only pending into pendingFriends
    this.pendingfriendsList.forEach((element) => {
      if (element.status === false)
      {
        this.requestsService.getUserInfo(element.user2).subscribe((user) => {
          this.pendingFriends.push(user);
        });
      }
    })
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }
  
}
