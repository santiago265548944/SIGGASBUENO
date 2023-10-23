import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpatialCrossingComponent } from './spatial-crossing.component';

describe('SpatialCrossingComponent', () => {
  let component: SpatialCrossingComponent;
  let fixture: ComponentFixture<SpatialCrossingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpatialCrossingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpatialCrossingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
