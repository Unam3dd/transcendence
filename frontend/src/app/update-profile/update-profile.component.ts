import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import {FormControl} from "@angular/forms";
import { UserInterface } from '../interfaces/user.interface';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent implements OnInit{
  userData$!: Observable<UserInterface> | null;
  firstname = new FormControl('');
  lastname = new FormControl('');
  nickname = new FormControl('');
  email = new FormControl('');
  a2f!: FormControl<boolean | null>;

  constructor(private requestService: RequestsService) {}

  ngOnInit(): void {
    this.userData$ = this.requestService.getLoggedUserInformation();

    this.userData$?.subscribe((userData: UserInterface) => {
      if (userData && userData.a2f !== undefined && userData.a2f !== null) {
        const a2fValue: boolean = userData.a2f;

        this.a2f = new FormControl(a2fValue);
      }
    });
  }

  updateDatas() {
    const firstname: string = this.firstname.value as string;
    const lastname: string = this.lastname.value as string;
    const nickname: string = this.nickname.value as string;
    const email: string = this.email.value as string;
    const a2f: boolean = this.a2f.value as boolean;

    this.requestService.updateUserDatas(firstname, lastname, nickname, email, a2f);
  }
}
