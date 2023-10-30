import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserInterface } from '../interfaces/user.interface';
import { RequestsService } from '../services/requests.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  constructor (private formBuilder: FormBuilder, private req: RequestsService) {}

  form = this.formBuilder.group({
    login: '',
    firstName: '',
    lastName: '',
    nickName: '',
    password: '',
    email: '',
    a2f: false
  });

  register() {
    const { login, firstName, lastName, nickName, email, password, a2f } = this.form.value;

    const userData: UserInterface = {
      login: login,
      firstName: firstName,
      lastName: lastName,
      nickName: nickName,
      email: email,
      password: password,
      a2f: a2f
    }

    this.req.registerUser(userData)?.subscribe();
  }
}
