import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoZoomComponent } from './geo-zoom.component';

describe('GeoZoomComponent', () => {
  let component: GeoZoomComponent;
  let fixture: ComponentFixture<GeoZoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoZoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
