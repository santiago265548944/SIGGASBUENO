import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffectedUsersComponent } from './affected-users.component';

describe('AffectedUsersComponent', () => {
  let component: AffectedUsersComponent;
  let fixture: ComponentFixture<AffectedUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffectedUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffectedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
