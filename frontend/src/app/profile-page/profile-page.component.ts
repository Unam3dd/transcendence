import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import { UserInterface } from '../interfaces/user.interface';
import { CookiesService } from '../services/cookies.service';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormControl} from "@angular/forms";
import { GameInfo, GameResult } from '../interfaces/game.interface';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit{
  constructor(private requestService: RequestsService,
              private cookieService: CookiesService,
              private modalService: NgbModal) {}

  userData$!: Observable<UserInterface> | null;
  myId:number = 0;
  firstname = new FormControl('');
  lastname = new FormControl('');
  nickname = new FormControl('');
  email = new FormControl('');
  a2f!: FormControl<boolean | null>;

  gameObserver$: Observable<GameResult[]> | undefined;
  gameHistory: GameResult[] = [];
  win: number = 0;
  loose: number = 0;
  winrate: number = 0.0;

  // Get data of user has been logged from backend service (NestJS)
  ngOnInit(): void {
    this.userData$ = this.requestService.getLoggedUserInformation();

    this.userData$?.subscribe((userData: UserInterface) => {
      if (userData && userData.a2f !== undefined && userData.a2f !== null) {
        const a2fValue: boolean = userData.a2f;

        this.a2f = new FormControl(a2fValue);
      }

      this.gameObserver$ = this.requestService.listGame(userData.id as number);

      this.gameObserver$?.subscribe((gameList: GameResult[]) => {
        this.gameHistory = gameList;
        this.win = this.countWin(gameList);
        this.loose = this.countLoose(gameList);
        this.winrate = (this.win / gameList.length) * 100;
      });
    });
  }

  countWin(gameList: GameResult[]): number {
    let counter: number = 0;
  
    gameList.forEach(element => {
      if (element.victory)
        counter++;
    })
    return (counter);
  }

  countLoose(gameList: GameResult[]): number{
    let counter: number = 0;
    gameList.forEach(element => {
      if (!element.victory)
        counter++;
    });
    return (counter);
  }

  Logout() {
    this.cookieService.removeCookie('authorization');
  }

  openModal(content: any) {
    this.modalService.open(content);
  }

  deleteUser() {
    this.requestService.deleteUser()?.subscribe();
    this.cookieService.removeCookie('authorization');
  }

  //update function for update the profile
  updateDatas() {
    const firstname: string = this.firstname.value as string;
    const lastname: string = this.lastname.value as string;
    const nickname: string = this.nickname.value as string;
    const email: string = this.email.value as string;
    const a2f: boolean = this.a2f.value as boolean;

    this.requestService.updateUserDatas(firstname, lastname, nickname, email, a2f);
  }
}
