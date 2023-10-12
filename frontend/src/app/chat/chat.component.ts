import { Component } from '@angular/core';
import { NotificationService } from '../services/notifications.service';

export interface test {

}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  constructor(private readonly snackBar: NotificationService) { }
  ngOnInit() {

    const name: string = 'salut';
    const test = { test: name, aurevoir: name}
    console.log(test);
    console.table(test);

    this.snackBar.notif("test", "test");
  }
}
