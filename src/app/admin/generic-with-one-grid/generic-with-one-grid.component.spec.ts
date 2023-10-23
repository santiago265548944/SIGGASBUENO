import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericWithOneGridComponent } from './generic-with-one-grid.component';

describe('GenericWithOneGridComponent', () => {
  let component: GenericWithOneGridComponent;
  let fixture: ComponentFixture<GenericWithOneGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericWithOneGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericWithOneGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
