import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecalculateAffectedUsersComponent } from './recalculate-affected-users.component';

describe('RecalculateAffectedUsersComponent', () => {
  let component: RecalculateAffectedUsersComponent;
  let fixture: ComponentFixture<RecalculateAffectedUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecalculateAffectedUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecalculateAffectedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
