import { Component } from '@angular/core';
import { NotificationService } from '../services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {

  constructor(private readonly snackBarService: NotificationService){}

}
