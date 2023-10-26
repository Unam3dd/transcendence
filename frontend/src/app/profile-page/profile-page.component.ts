import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import {UpdateProfileComponent} from "../update-profile/update-profile.component";
import { UserInterface } from '../interfaces/user.interface';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  userData$!: Observable<UserInterface> | null;
  constructor(private requestService: RequestsService,
              private modalService: NgbModal) {}


  // Get data of user has been logged from backend service (NestJS)
  ngOnInit(): void {
    this.userData$ = this.requestService.getLoggedUserInformation();
  }

  openDialog() {
    this.modalService.open(UpdateProfileComponent, {size: "lg"});
  }
}
