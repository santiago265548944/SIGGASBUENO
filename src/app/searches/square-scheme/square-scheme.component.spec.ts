import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareSchemeComponent } from './square-scheme.component';

describe('SquareSchemeComponent', () => {
  let component: SquareSchemeComponent;
  let fixture: ComponentFixture<SquareSchemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SquareSchemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SquareSchemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
