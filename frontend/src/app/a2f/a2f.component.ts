import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RequestsService } from '../services/requests.service';
import { HttpStatusCode } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';
import { TimerService } from '../services/timer.service';
import { IP_SERVER, PROFILE_PAGE, PROTO } from '../env';
import { CookiesService } from '../services/cookies.service';
import { isEmpty } from 'rxjs';

@Component({
  selector: 'app-a2f',
  templateUrl: './a2f.component.html',
  styleUrls: ['./a2f.component.scss']
})
export class A2fComponent {

  form = this.formBuilder.group({
    token: ''
  })

  constructor (private formBuilder: FormBuilder, private req: RequestsService, private notif: NotificationsService,
    private timer: TimerService, private cookieService: CookiesService) {}

  a2f() {

    this.req.sendA2fToken(this.form.value.token)?.subscribe(async (res) => {

      if (res.status == HttpStatusCode.Unauthorized) {
        this.notif.error('Error', 'Your token is invalid !');
        this.cookieService.removeCookie('tmp_name');
        await this.timer.sleep(2000);
        window.location.href = PROFILE_PAGE;
      }

      const { token } = JSON.parse(JSON.stringify(res.body));

      const login = this.cookieService.getCookie('tmp_name');

      this.cookieService.setCookie('authorization', token);

      this.notif.success('You are connected !', `You are connected with ${login} welcome !`);
      this.cookieService.removeCookie('tmp_name');
      await this.timer.sleep(3000);
      window.location.href = PROFILE_PAGE;
    })
  }

}
