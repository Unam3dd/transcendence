import { Component } from '@angular/core';
import { CLIENT_ID, PROFILE_PAGE, REDIRECT_URI } from '../env';
import { FormBuilder } from '@angular/forms';
import { isEmpty } from 'class-validator';
import { RequestsService } from '../services/requests.service';
import { NotificationService } from '../services/notifications.service';
import { TimerService } from '../services/timer.service';
import { CookiesService } from '../services/cookies.service';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {

  constructor(private formsBuilder: FormBuilder, 
    private req: RequestsService,
    private readonly notif: NotificationService,
    private readonly timeService: TimerService,
    private cookieServcie: CookiesService) {}

  form = this.formsBuilder.group({
    login: '',
    password: ''
  });

  connection42API() {
    window.location.href=`https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`
  }

  connection() {
    const { login, password } = this.form.value;

    if (isEmpty(login) || isEmpty(password)) return ;

    this.req.loginUser(<string>login, <string>password).subscribe(async (res) => {

      const { token } = JSON.parse(JSON.stringify(res.body));

      this.cookieServcie.setCookie('authorization', token);

      this.notif.showNotification(`You are connected with ${login} !`);
      await this.timeService.sleep(2000);
      window.location.href = PROFILE_PAGE;
    }, async () => {
      this.notif.showNotification('Error Your login or password is not correct !');
      return ;
    })
  }
}
