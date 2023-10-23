import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManejoPrensasComponent } from './manejo-prensas.component';

describe('ManejoPrensasComponent', () => {
  let component: ManejoPrensasComponent;
  let fixture: ComponentFixture<ManejoPrensasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManejoPrensasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManejoPrensasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
