import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserInterface } from '../interfaces/user.interface';
import { RequestsService } from '../services/requests.service';
import { NotificationService } from '../services/notifications.service';
import { TimerService } from '../services/timer.service';
import { LOGIN_PAGE } from '../env';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  responseData: any;

  constructor (private formBuilder: FormBuilder, private req: RequestsService, private timerService: TimerService, private notif: NotificationService) {}

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
      is42: false
    };

    this.req.registerUser(userData).subscribe(async () => {
      this.notif.showNotification(`Your account has been created successfully !`);
      await this.timerService.sleep(3000);
      window.location.href = `${LOGIN_PAGE}`
    }, () => {
      this.notif.showNotification(`Error You not respect the expected answer to perform registration !`)
    });
  }
}
