import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StationComponentComponent } from './station-component.component';

describe('StationComponentComponent', () => {
  let component: StationComponentComponent;
  let fixture: ComponentFixture<StationComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StationComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StationComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
