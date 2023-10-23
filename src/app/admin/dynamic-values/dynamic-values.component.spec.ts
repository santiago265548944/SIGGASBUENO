import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicValuesComponent } from './dynamic-values.component';

describe('DynamicValuesComponent', () => {
  let component: DynamicValuesComponent;
  let fixture: ComponentFixture<DynamicValuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicValuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
