import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatrolComponent } from './patrol.component';

describe('PatrolComponent', () => {
  let component: PatrolComponent;
  let fixture: ComponentFixture<PatrolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatrolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
