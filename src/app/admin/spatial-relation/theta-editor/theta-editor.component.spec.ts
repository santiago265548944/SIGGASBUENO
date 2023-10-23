import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThetaEditorComponent } from './theta-editor.component';

describe('ThetaEditorComponent', () => {
  let component: ThetaEditorComponent;
  let fixture: ComponentFixture<ThetaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThetaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThetaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
