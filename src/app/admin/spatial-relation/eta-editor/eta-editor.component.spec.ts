import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EtaEditorComponent } from './eta-editor.component';

describe('EtaEditorComponent', () => {
  let component: EtaEditorComponent;
  let fixture: ComponentFixture<EtaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
