import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {RequestsService} from "../services/requests.service";
import {Observable} from "rxjs";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  userData$!: Observable<any>;
  nickname = new FormControl('');
  email = new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3}$/)]);

  constructor(private router: Router,
              private profilePageService: RequestsService) {}

  ngOnInit() {
    this.userData$ = this.profilePageService.getUserData();
  }

  //Affiche une erreur si le champ email est vide ou si l'email est non valide
  getEmptyErrorMessage() {
    if (this.email.hasError('required')) {
      return 'Please enter a value';
    }
    return this.email.hasError('pattern') ? 'Not a valid email': '';
  }

  //Change pour le template de profile
  moveToProfile() {
    this.router.navigateByUrl('profile');
  }

  //Change pour le template de Game
  moveToGame() {
    this.router.navigateByUrl('game');
  }

  //Change pour le template de Chat
  moveToChat() {
    this.router.navigateByUrl('chat');
  }

  //Update du nickname de l'utilisateur puis reload la page
  updateNickname() {
    const newNickname: string = this.nickname.value as string;
    const newEmail: string = this.email.value as string;
    this.profilePageService.updateUserHomeData(newNickname, newEmail).subscribe(() => {
      window.location.reload();
    });
  }
}
