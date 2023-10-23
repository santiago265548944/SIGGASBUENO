import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PneumaticTestComponent } from './pneumatic-test.component';

describe('PneumaticTestComponent', () => {
  let component: PneumaticTestComponent;
  let fixture: ComponentFixture<PneumaticTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PneumaticTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PneumaticTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
