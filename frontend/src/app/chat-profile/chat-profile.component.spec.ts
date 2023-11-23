import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatProfileComponent } from './chat-profile.component';

describe('ChatProfileComponent', () => {
  let component: ChatProfileComponent;
  let fixture: ComponentFixture<ChatProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatProfileComponent]
    });
    fixture = TestBed.createComponent(ChatProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
