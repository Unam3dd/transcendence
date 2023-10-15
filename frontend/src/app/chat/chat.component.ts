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

   this.snackBar.friend_notification("chjoie"); // ici pour test, mais la fonction doit être appelé lorsque l'on recoit l'evenement dans les websockets

  }
}
