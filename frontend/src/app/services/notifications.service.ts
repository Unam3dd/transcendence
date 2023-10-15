import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationsComponent } from '../notifications/notifications.component';

export interface notificationsInterface{
  text: string,
  action: number, // voir enum ?
  target: string // userInterface instead of a string ?
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly snackBar: MatSnackBar) {}

  friend_notification(name: string) {

    const notifications_info: notificationsInterface = {
      text: " send you a friend request",
      action: 1,
      target: name
    }

    this.snackBar.openFromComponent(NotificationsComponent, {
      data: notifications_info,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      duration: 5000
    });
  }
}
