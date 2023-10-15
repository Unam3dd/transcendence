import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { notificationsInterface } from '../services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent{

  constructor(private snackBarRef: MatSnackBarRef<NotificationsComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: notificationsInterface){}

  action(){
    if (this.data.action === 1)
      this.accept_friends();
  }

  accept_friends()
  {
    console.log('need to make update friend request in requests service');
    this.snackBarRef.dismiss();
  }

  close()
  {
    console.log('notification closed');
    this.snackBarRef.dismiss();
  }
}
