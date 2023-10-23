import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolyvalvulasByLocationComponent } from './polyvalvulas-by-location.component';

describe('PolyvalvulasByLocationComponent', () => {
  let component: PolyvalvulasByLocationComponent;
  let fixture: ComponentFixture<PolyvalvulasByLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolyvalvulasByLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolyvalvulasByLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
