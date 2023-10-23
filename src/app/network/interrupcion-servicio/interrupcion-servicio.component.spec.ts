import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterrupcionServicioComponent } from './interrupcion-servicio.component';

describe('InterrupcionServicioComponent', () => {
  let component: InterrupcionServicioComponent;
  let fixture: ComponentFixture<InterrupcionServicioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterrupcionServicioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterrupcionServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
