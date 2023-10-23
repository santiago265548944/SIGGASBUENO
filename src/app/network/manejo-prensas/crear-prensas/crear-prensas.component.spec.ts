import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPrensasComponent } from './crear-prensas.component';

describe('CrearPrensasComponent', () => {
  let component: CrearPrensasComponent;
  let fixture: ComponentFixture<CrearPrensasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearPrensasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPrensasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
