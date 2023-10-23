import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticReportsComponent } from './statistic-reports.component';

describe('StatisticReportsComponent', () => {
  let component: StatisticReportsComponent;
  let fixture: ComponentFixture<StatisticReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
