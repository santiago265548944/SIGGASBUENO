import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XycoordinateComponent } from './xycoordinate.component';

describe('XycoordinateComponent', () => {
  let component: XycoordinateComponent;
  let fixture: ComponentFixture<XycoordinateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XycoordinateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XycoordinateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
