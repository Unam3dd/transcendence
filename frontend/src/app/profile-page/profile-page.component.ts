import {Component, OnInit} from '@angular/core';
import {ProfilePageService} from "../services/profile-page.service";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{

  userId: number = 1;
  firstName: string = "";
  lastName: string = "";

  constructor(private profilePageService: ProfilePageService) {}

  ngOnInit(): void {
    this.profilePageService.getData(this.userId).subscribe((data: any) => {
      this.firstName = data.firstName;
      this.lastName = data.lastName;
    });
  }
}
