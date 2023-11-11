import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RequestsService } from '../services/requests.service';

@Component({
  selector: 'app-a2f',
  templateUrl: './a2f.component.html',
  styleUrls: ['./a2f.component.scss']
})
export class A2fComponent {

  form = this.formBuilder.group({
    token: ''
  })

  constructor (private formBuilder: FormBuilder, private readonly req: RequestsService) {}

  a2f() {
    if (!this.form.value.token) return ;
    this.req.sendA2fToken(this.form.value.token);
  }

}
