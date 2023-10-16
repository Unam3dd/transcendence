import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  ngOnInit() {

    const name = 'salut';
    const test = { test: name, aurevoir: name}
    console.log(test);
    console.table(test);
  }
}
