import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegendThematicComponent } from './legend-thematic.component';

describe('LegendThematicComponent', () => {
  let component: LegendThematicComponent;
  let fixture: ComponentFixture<LegendThematicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegendThematicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendThematicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
