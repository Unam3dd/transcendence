import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationsComponent } from '../notifications/notifications.component';
import { notificationsInterface, Action } from '../interfaces/notifications.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly snackBar: MatSnackBar) {}

  friend_notification(name: string, id: number) {

    const notifications_info: notificationsInterface = {
      sender_name: name,
      text: " send you a friend request",
      action: Action.friends_request,
      sender_id: id
    }

    this.snackBar.openFromComponent(NotificationsComponent, {
      data: notifications_info,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      duration: 5000
    });
  }
}
