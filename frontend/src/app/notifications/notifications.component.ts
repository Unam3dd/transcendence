import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { notificationsInterface, Action } from '../interfaces/notifications.interface';
import { CookiesService } from '../services/cookies.service';
import { RequestsService } from '../services/requests.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent{

  constructor(private readonly snackBarRef: MatSnackBarRef<NotificationsComponent>, 
    @Inject(MAT_SNACK_BAR_DATA) public readonly data: notificationsInterface,
    private readonly cookieService: CookiesService,
    private readonly requestService: RequestsService) {}

  // if user click on the accept button
  accept(){
    if (this.data.action === Action.friends_request)
      this.acceptFriends();
  }

  // if user click on the reject button
  reject()
  {
    if (this.data.action === Action.friends_request)
      this.rejectFriends();
  }


  acceptFriends()
  {
    // get the userId that receive the notifications
    const [token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];
    const userId = this.requestService.getId(token);

    if (!userId)
      throw(Error("user not found"));

    // Accept the friend Request
    this.requestService.updateFriendsStatus(this.data.sender_id, userId);
    this.snackBarRef.dismiss();
  }

  rejectFriends()
  {
    // get the userId that receive the notifications
    const [token] = this.cookieService.getCookie('authorization')?.split('%20') ?? [];
    const userId = this.requestService.getId(token);

    if (!userId)
      throw(Error("user not found"));

    // Reject the friend request and delete the friendship in the database
    this.requestService.deleteFriends(this.data.sender_id, userId);
    this.snackBarRef.dismiss();
  }
}
