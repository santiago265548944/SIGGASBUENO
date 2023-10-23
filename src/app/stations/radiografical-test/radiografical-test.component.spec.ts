import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiograficalTestComponent } from './radiografical-test.component';

describe('RadiograficalTestComponent', () => {
  let component: RadiograficalTestComponent;
  let fixture: ComponentFixture<RadiograficalTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadiograficalTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiograficalTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
