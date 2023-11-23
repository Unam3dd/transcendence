import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-end-match',
  template: ` 
  <div class="modal-header">
    <h4 class="modal-title" id="modal-basic-title">Game Result</h4>
  </div>
  <div *ngIf="!local" class="modal-body">
    <p *ngIf="result">Congratulations you Win!</p>
    <p *ngIf="!result">Sorry you Loose!</p>
    <button type="button" class="btn btn-secondary" (click)="next()">Back to Menu</button>
  </div>
  <div *ngIf="local" class="modal-body">
  <p *ngIf="result">Congratulations to {{winner}}!</p>
  <button type="button" class="btn btn-secondary" (click)="next()">Back to Menu</button>
</div>
  `,
  styleUrls: ['./end-match.component.scss']
})
export class EndMatchComponent {
  @ViewChild('endMatchModal') endMatchModal!: ElementRef;
  @Input() result!: boolean;
  @Input() local!: boolean;
  @Input() winner!: string;

  constructor(public activeModal: NgbActiveModal, private router: Router,) {}

  public next(){
    console.log("go to menu page");
    this.activeModal.dismiss();
    this.router.navigate(['game-menu']);
  }

}
