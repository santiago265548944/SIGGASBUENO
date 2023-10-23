import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FatherOrderComponent } from './father-order.component';

describe('FatherOrderComponent', () => {
  let component: FatherOrderComponent;
  let fixture: ComponentFixture<FatherOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FatherOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FatherOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
