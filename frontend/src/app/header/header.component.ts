import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {UserInterface} from "../interfaces/user.interface";
import {RequestsService} from "../services/requests.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;

  constructor(private router: Router,
              private requestsService: RequestsService) {}

  ngOnInit() {
    this.userData$ = this.requestsService.getLoggedUserInformation();
  }

  moveToHome() {
    this.router.navigateByUrl('home');
  }
}
