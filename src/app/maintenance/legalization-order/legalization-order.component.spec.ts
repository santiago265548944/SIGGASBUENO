import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalizationOrderComponent } from './legalization-order.component';

describe('LegalizationOrderComponent', () => {
  let component: LegalizationOrderComponent;
  let fixture: ComponentFixture<LegalizationOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegalizationOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalizationOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
