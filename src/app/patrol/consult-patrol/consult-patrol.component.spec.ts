import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultPatrolComponent } from './consult-patrol.component';

describe('ConsultPatrolComponent', () => {
  let component: ConsultPatrolComponent;
  let fixture: ComponentFixture<ConsultPatrolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultPatrolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultPatrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
