import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekPredioComponent } from './seek-predio.component';

describe('SeekPredioComponent', () => {
  let component: SeekPredioComponent;
  let fixture: ComponentFixture<SeekPredioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeekPredioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeekPredioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
