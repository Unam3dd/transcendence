import { Component } from '@angular/core';

export interface test {

}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  ngOnInit() {

    const name: string = 'salut';
    const test = { test: name, aurevoir: name}
    console.log(test);
    console.table(test);
  }
}
