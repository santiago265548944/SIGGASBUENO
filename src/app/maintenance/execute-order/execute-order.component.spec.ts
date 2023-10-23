import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecuteOrderComponent } from './execute-order.component';

describe('ExecuteOrderComponent', () => {
  let component: ExecuteOrderComponent;
  let fixture: ComponentFixture<ExecuteOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecuteOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecuteOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
