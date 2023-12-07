import { Component } from '@angular/core';
import { CLIENT_ID, HOME_PAGE, LOGIN_PAGE, REDIRECT_URI} from '../env';
import { FormBuilder } from '@angular/forms';
import { isEmpty } from 'class-validator';
import { RequestsService } from '../services/requests.service';
import { TimerService } from '../services/timer.service';
import { CookiesService } from '../services/cookies.service';
import { NotificationsService } from 'angular2-notifications';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {

  constructor(private formsBuilder: FormBuilder, 
    private req: RequestsService,
    private readonly notif: NotificationsService,
    private readonly timeService: TimerService,
    private cookieService: CookiesService) {}

  form = this.formsBuilder.group({
    login: '',
    password: ''
  });

  tokenForm = this.formsBuilder.group({
    token: ''
  })

  double_factor: boolean = false;

  connection42API() {
    window.location.href=`https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`
  }

  connection() {
    const { login, password } = this.form.value;

    if (isEmpty(login) || isEmpty(password)) return ;

    this.req.loginUser(<string>login, <string>password).subscribe(async (res) => {

      const { a2f } = JSON.parse(JSON.stringify(res.body));

      if (res.status == HttpStatusCode.Ok && a2f) {
        this.cookieService.setCookie('tmp_name', `${btoa(<string>login)}`);
        this.double_factor = true;
        return ;
      }

      const { token } = JSON.parse(JSON.stringify(res.body));

      this.cookieService.setCookie('authorization', token);

      this.notif.success('You are connected !', `You are connected, ${login} ! Welcome !`);
      await this.timeService.sleep(2000);
      window.location.href = HOME_PAGE;
    }, async () => {
      this.notif.error('Error', 'Your login or password is not correct !');
      return ;
    })
  }

  a2f() {
    this.req.sendA2fToken(this.tokenForm.value.token).subscribe(async (res) => {

      const { token } = JSON.parse(JSON.stringify(res.body));

      const login: string | null = this.cookieService.getCookie('tmp_name');

      if (!login) {
        this.notif.error('Error', 'Your token is invalid !');
        this.cookieService.removeCookie('tmp_name');
        await this.timeService.sleep(2000);
        window.location.href = LOGIN_PAGE;
        return ;
      }

      this.cookieService.setCookie('authorization', token);

      this.notif.success('You are connected !', `You are connected, ${atob(login)} ! welcome !`);
      await this.timeService.sleep(2000);
      this.cookieService.removeCookie('tmp_name');
      window.location.href = HOME_PAGE;
    }, async () => {
      this.notif.error('Error', 'Your token is invalid !');
      this.cookieService.removeCookie('tmp_name');
      await this.timeService.sleep(2000);
      window.location.href = LOGIN_PAGE;
    })
  }
}
