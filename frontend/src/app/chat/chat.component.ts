import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  ngOnInit() {
    console.log('hello chat !');
  }
}
