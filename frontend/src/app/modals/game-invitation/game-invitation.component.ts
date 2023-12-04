import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebsocketService } from '../../websocket/websocket.service';
import { WsClient } from '../../websocket/websocket.type';
import { Router } from '@angular/router';
import { OnlineState } from 'src/app/enum/status.enum';

@Component({
  selector: 'app-game-invitation',
  template: ` 
  <div class="modal-header">
    <h4 class="modal-title" id="modal-basic-title">Game Invitation</h4>
  </div>
  <div class="modal-body">
    <div class="row mt-3 mb-3 d-flex align-items-center">
      <div class="col-2">
        <div class="avatar-container60">
          <img class="avatar" [src]="hostAvatar" alt="avatar picture">
        </div>
      </div>
      <div class="col-10" style="text-align: left">
        <p> {{host}} invite you to play a game!</p>
      </div>
    </div>
    <button type="button" class="btn btn-secondary" (click)="accept()">Accept</button>
    <button type="button" class="btn btn-danger" (click)="decline()" >Decline</button>
  </div>
  `,
  styleUrls: ['./game-invitation.component.scss']
})
export class GameInvitationComponent {
  @ViewChild('invitationModal') invitationModal!: ElementRef;
  @Input() invitation!: string;
  @Input() host!: string;
  @Input() hostAvatar!: string;
  
  constructor(public activeModal: NgbActiveModal, private readonly ws: WebsocketService, private router: Router,) {}
  
  client: WsClient = this.ws.getClient();

  public accept(){
    console.log("accept game invit");
    this.ws.changeStatus(this.client, OnlineState.ingame);
    this.ws.joinPrivateGame(this.client, this.invitation);
    this.activeModal.dismiss();
    this.router.navigate(['game/remote']);
  }

  public decline () {
    console.log("decline game invit");
    this.ws.declinePrivateGame(this.client, this.invitation);
    this.activeModal.dismiss();
  }
}
