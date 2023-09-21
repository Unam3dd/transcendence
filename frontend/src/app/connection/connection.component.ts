import { Component } from '@angular/core';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {

  connection() {
    window.location.href='https://www.google.fr/?gfe_rd=cr&ei=WJywU4LPI4TZ8get14CIDQ'
  }
}
