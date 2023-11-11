import { ComponentFixture, TestBed } from '@angular/core/testing';

import { A2fComponent } from './a2f.component';

describe('A2fComponent', () => {
  let component: A2fComponent;
  let fixture: ComponentFixture<A2fComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [A2fComponent]
    });
    fixture = TestBed.createComponent(A2fComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
