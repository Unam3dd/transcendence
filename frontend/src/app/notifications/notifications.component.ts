import { Component } from '@angular/core';
import { SnackBarService } from '../services/snack-bar.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {

  constructor(private readonly snackBarService: SnackBarService){}

}
