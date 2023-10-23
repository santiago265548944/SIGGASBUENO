import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericWithTwoGridsComponent } from './generic-with-two-grids.component';

describe('GenericWithTwoGridsComponent', () => {
  let component: GenericWithTwoGridsComponent;
  let fixture: ComponentFixture<GenericWithTwoGridsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericWithTwoGridsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericWithTwoGridsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
