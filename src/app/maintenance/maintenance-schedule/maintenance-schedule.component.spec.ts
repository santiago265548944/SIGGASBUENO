import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceScheduleComponent } from './maintenance-schedule.component';

describe('MaintenanceScheduleComponent', () => {
  let component: MaintenanceScheduleComponent;
  let fixture: ComponentFixture<MaintenanceScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
