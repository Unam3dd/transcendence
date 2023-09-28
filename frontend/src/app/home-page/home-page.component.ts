import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProfilePageService} from "../services/profile-page.service";
import {Observable, Subject} from "rxjs";
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  userId: number = 1;
  userData$!: Observable<any>;
  newNickname: string = "";
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private router: Router,
              private profilePageService: ProfilePageService) {}

  ngOnInit() {
    this.userData$ = this.profilePageService.getData(this.userId);
  }

  //Change pour le template de profile
  moveToProfile() {
    this.router.navigateByUrl('profile');
  }

  //Change pour le template de Game
  moveToGame() {
    this.router.navigateByUrl('game');
  }

  //Update du nickname de l'utilisateur
  updateNickname() {
    this.profilePageService
      .updateUserNickname(this.userId, this.newNickname)
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe((userData) =>{
        this.userData$ = userData;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
