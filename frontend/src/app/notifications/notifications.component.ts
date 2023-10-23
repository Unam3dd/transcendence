import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { notificationsInterface, Action } from '../interfaces/notifications.interface';
import { RequestsService } from '../services/requests.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent{

  constructor(private readonly snackBarRef: MatSnackBarRef<NotificationsComponent>, 
    @Inject(MAT_SNACK_BAR_DATA) public readonly data: notificationsInterface,
    private readonly requestService: RequestsService) {}

  // if user click on the accept button
  accept() {
    if (this.data.action === Action.friends_request)
      this.acceptFriends();
  }

  // if user click on the reject button
  reject() {
    if (this.data.action === Action.friends_request)
      this.rejectFriends();
  }

  acceptFriends() {
    this.requestService.updateFriendsStatus(this.data.sender_id)?.subscribe();
    this.snackBarRef.dismiss();
  }

  rejectFriends() {
    this.requestService.deleteFriends(this.data.sender_id)?.subscribe();
    this.snackBarRef.dismiss();
  }
}
