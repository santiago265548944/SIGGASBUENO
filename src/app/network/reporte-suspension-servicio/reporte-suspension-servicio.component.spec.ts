import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteSuspensionServicioComponent } from './reporte-suspension-servicio.component';

describe('ReporteSuspensionServicioComponent', () => {
  let component: ReporteSuspensionServicioComponent;
  let fixture: ComponentFixture<ReporteSuspensionServicioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteSuspensionServicioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteSuspensionServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
