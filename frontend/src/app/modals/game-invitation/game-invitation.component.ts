import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebsocketService } from '../../websocket/websocket.service';
import { WsClient } from '../../websocket/websocket.type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-invitation',
  template: ` 
  <div class="modal-header">
    <h4 class="modal-title" id="modal-basic-title">Game Invitation</h4>
  </div>
  <div class="modal-body">
    <img class="avatar" [src]="hostAvatar" alt="avatar picture"> 
    <p> {{host}} invite you to play a game!</p>
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
