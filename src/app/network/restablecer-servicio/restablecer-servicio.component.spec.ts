import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestablecerServicioComponent } from './restablecer-servicio.component';

describe('RestablecerServicioComponent', () => {
  let component: RestablecerServicioComponent;
  let fixture: ComponentFixture<RestablecerServicioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestablecerServicioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestablecerServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
