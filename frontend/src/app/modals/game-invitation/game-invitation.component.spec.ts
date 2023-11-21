import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInvitationComponent } from './game-invitation.component';

describe('GameInvitationComponent', () => {
  let component: GameInvitationComponent;
  let fixture: ComponentFixture<GameInvitationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameInvitationComponent]
    });
    fixture = TestBed.createComponent(GameInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
