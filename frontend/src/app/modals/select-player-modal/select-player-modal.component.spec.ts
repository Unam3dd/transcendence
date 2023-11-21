import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPlayerModalComponent } from './select-player-modal.component';

describe('SelectPlayerModalComponent', () => {
  let component: SelectPlayerModalComponent;
  let fixture: ComponentFixture<SelectPlayerModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectPlayerModalComponent]
    });
    fixture = TestBed.createComponent(SelectPlayerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
