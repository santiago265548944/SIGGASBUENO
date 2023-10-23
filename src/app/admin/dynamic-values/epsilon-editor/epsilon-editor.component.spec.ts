import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpsilonEditorComponent } from './epsilon-editor.component';

describe('EpsilonEditorComponent', () => {
  let component: EpsilonEditorComponent;
  let fixture: ComponentFixture<EpsilonEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpsilonEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpsilonEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
