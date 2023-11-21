import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoteGameComponent } from './remote-game.component';

describe('GamePageComponent', () => {
  let component: RemoteGameComponent;
  let fixture: ComponentFixture<RemoteGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemoteGameComponent]
    });
    fixture = TestBed.createComponent(RemoteGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
