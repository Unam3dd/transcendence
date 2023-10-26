import { Component } from '@angular/core';
import { CLIENT_ID, REDIRECT_URI } from '../env';
import { FormBuilder } from '@angular/forms';
import { isEmpty } from 'class-validator';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {

  constructor(private formsBuilder: FormBuilder) {}

  form = this.formsBuilder.group({
    username: '',
    password: ''
  });

  connection42API() {
    window.location.href=`https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`
  }

  connection() {
    const { username, password } = this.form.value;

    if (isEmpty(username) || isEmpty(password)) return ;
  }
}
