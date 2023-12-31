import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserInterface } from '../interfaces/user.interface';
import { RequestsService } from '../services/requests.service';
import { TimerService } from '../services/timer.service';
import { LOGIN_PAGE } from '../env';
import { NotificationsService } from 'angular2-notifications';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  responseData: any;
  qrcode: Object | null = null;
  redirectLogin: string = LOGIN_PAGE;

  constructor (private formBuilder: FormBuilder, private req: RequestsService, private timerService: TimerService, private notif: NotificationsService) {}

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
      a2f: a2f,
      is42: false,
      a2fsecret: null
    };

    this.req.registerUser(userData).subscribe(async (res) => {

      this.notif.success('Success', 'Your account has been successfully created !');
      if (res.status == HttpStatusCode.Created) {
        this.qrcode = res.body;
        return ;
      }
      await this.timerService.sleep(3000);
      window.location.href = `${LOGIN_PAGE}`
    }, () => {
      this.notif.error('Error', 'Registration failed.');//format and availability of credentials may cause this failure
    });
  }
}
