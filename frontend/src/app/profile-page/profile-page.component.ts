import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RequestsService} from "../services/requests.service";
import {UserInterface} from '../interfaces/user.interface';
import {CookiesService} from '../services/cookies.service';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormControl} from "@angular/forms";
import {NotificationsService} from 'angular2-notifications';
import {GameResult} from '../interfaces/game.interface';
import {WebsocketService} from "../websocket/websocket.service";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit, OnDestroy{
  constructor(private requestService: RequestsService,
              private cookieService: CookiesService,
              private modalService: NgbModal,
              private notif: NotificationsService,
              private websocketService: WebsocketService) {}

  userData$!: Observable<UserInterface> | null;
  qrcodeURL = '';
  myId:number = 0;

  firstnameForm!: FormControl<string | null>;
  firstname: string = '';

  lastnameForm!: FormControl<string | null>;
  lastname: string = '';

  nicknameForm!: FormControl<string | null>;
  nickname: string = '';

  emailForm!: FormControl<string | null>;
  email: string = '';

  a2fForm!: FormControl<boolean | null>;
  a2f: boolean = false;

  fileForm: File | null = null;
  avatar: string = '';

  gameObserver$: Observable<GameResult[]> | undefined;
  gameHistory: GameResult[] = [];
  win: number = 0;
  loose: number = 0;
  winrate: number = 0;

  // Get data of user has been logged from backend service (NestJS)
  ngOnInit(): void {
    const client = this.websocketService.getClient();

    client.on('refreshDataProfile', (data) => {
      this.firstname = data.firstName;
      this.lastname = data.lastName;
      this.nickname = data.nickName;
      this.email = data.email;
      this.a2f = data.a2f;
      this.avatar = data.avatar;
    });

    this.userData$ = this.requestService.getLoggedUserInformation();

    this.userData$?.subscribe((userData: UserInterface) => {
      if (userData && userData.firstName !== null && userData.firstName !== undefined) {
        const firstnameValue: string = userData.firstName;

        this.firstnameForm = new FormControl(firstnameValue);
        this.firstname = firstnameValue;
      }

      if (userData && userData.lastName !== null && userData.lastName !== undefined) {
        const lastnameValue: string = userData.lastName;

        this.lastnameForm = new FormControl(lastnameValue);
        this.lastname = lastnameValue;
      }

      if (userData && userData.nickName !== null && userData.nickName !== undefined) {
        const nicknameValue: string = userData.nickName;

        this.nicknameForm = new FormControl(nicknameValue);
        this.nickname = nicknameValue;
      }

      if (userData && userData.email !== null && userData.email !== undefined) {
        const emailValue: string = userData.email;

        this.emailForm = new FormControl(emailValue);
        this.email = emailValue;
      }

      if (userData && userData.a2f !== undefined && userData.a2f !== null) {
        const a2fValue: boolean = userData.a2f;

        this.a2fForm = new FormControl(a2fValue);
        this.a2f = a2fValue;
      }

      if (userData && userData.avatar !== null && userData.avatar !== undefined) {
        this.avatar = userData.avatar;
      }

      this.gameObserver$ = this.requestService.listGame(userData.id as number);

      this.gameObserver$?.subscribe((gameList: GameResult[]) => {
        this.gameHistory = gameList.reverse();
        this.dateFormat();
        this.win = this.countWin(gameList);
        this.loose = this.countLoose(gameList);
        this.winrate = ((this.win / gameList.length) * 100) || 0;
        this.winrate = Number(this.winrate.toFixed(2));
      });
    });
  }

  dateFormat(): void {
    this.gameHistory.forEach((el) => {
      el.createdAt = el.createdAt.substring(0,10);
    })
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

  openModal(content: any) {
    this.modalService.open(content);
  }

  deleteUser() {
    this.requestService.deleteUser()?.subscribe();
    this.cookieService.removeCookie('authorization');
  }

  onFileSelected(event: any) {
    this.fileForm = event.target.files[0] as File;
  }

  updateDatas() {
    if (this.fileForm) {
      this.requestService.uploadUserImage(this.fileForm)?.subscribe(() => {
        this.updateDatasWithoutImage();
      });
    } else {
      this.updateDatasWithoutImage();
    }

  }

  async updateDatasWithoutImage() {
    const firstname: string = this.firstnameForm.value as string;
    const lastname: string = this.lastnameForm.value as string;
    const nickname: string = this.nicknameForm.value as string;
    const email: string = this.emailForm.value as string;
    const a2f: boolean = this.a2fForm.value as boolean;
    const client = this.websocketService.getClient();

    const observable = await this.requestService.updateUserDatas(firstname, lastname, nickname, email, a2f)

    observable?.subscribe(async (data) => {
      this.notif.success('Profile Updated successfully !', 'Your profile has been updated');
      const { token, qrcode } = JSON.parse(JSON.stringify(data));
      this.qrcodeURL = qrcode;
      this.cookieService.removeOnlyCookie('authorization');
      this.cookieService.setCookie('authorization', JSON.parse(JSON.stringify(`Bearer ${token}`)));
      client.emit('refreshData');
    }, () => {
      this.notif.error('Error', 'an error occurred when changing the profile');
    })
  }


  ngOnDestroy() {
    const client = this.websocketService.getClient();

    client.off('refreshDataProfile');
  }
}
