import { Component } from '@angular/core';
import { SnackBarService } from '../services/snack-bar.service';

export interface test {

}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  constructor(private readonly snackBar: SnackBarService) { }
  ngOnInit() {

    const name: string = 'salut';
    const test = { test: name, aurevoir: name}
    console.log(test);
    console.table(test);

    this.snackBar.notif("test", "test");
  }
}
