import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceHistoricComponent } from './maintenance-historic.component';

describe('MaintenanceHistoricComponent', () => {
  let component: MaintenanceHistoricComponent;
  let fixture: ComponentFixture<MaintenanceHistoricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceHistoricComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceHistoricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
