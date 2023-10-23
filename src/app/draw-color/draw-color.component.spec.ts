import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawColorComponent } from './draw-color.component';

describe('DrawColorComponent', () => {
  let component: DrawColorComponent;
  let fixture: ComponentFixture<DrawColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
