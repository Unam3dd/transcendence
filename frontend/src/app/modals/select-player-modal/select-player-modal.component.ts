import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-select-player-modal',
  template: `
  <div class="modal-header">
  <h4 class="modal-title" id="modal-basic-title">Choose your nickname:</h4>
</div>
<div class="modal-body">
  <form [formGroup]="form" (ngSubmit)="closeModal()">
    <div class="mb-3">
      Guest {{number}} choose your nickname :
    </div>
    <input id="nickname" type="text" placeholder="Choose a nickname" formControlName="nickname" minlength="3" maxlength="120">
    <button type="button" class="btn btn-danger" (click)="processModal()">Accept</button>
    <button class="btn btn-danger" (click)="closeModal()">Cancel</button>
  </form>
</div>
`,
  styleUrls: ['./select-player-modal.component.scss'],
})
export class SelectPlayerModalComponent {
  @Input() number!: number;

  constructor (private formsBuilder: FormBuilder, public activeModal: NgbActiveModal ) {}

  form = this.formsBuilder.group({
    nickname: '',
  });

  processModal() {

    const nickname = this.form.value.nickname as string;
    if (nickname.trim().length >= 3 && nickname.trim().length <= 12)
      this.activeModal.close(nickname);
    else
    {
      console.log("empty");
      alert('Your nickname must be between 3 and 12 characters');
    }
  }

  closeModal()
  {
    this.activeModal.close();
  }
}
