import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalizationDirectComponent } from './legalization-direct.component';

describe('LegalizationDirectComponent', () => {
  let component: LegalizationDirectComponent;
  let fixture: ComponentFixture<LegalizationDirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegalizationDirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalizationDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
