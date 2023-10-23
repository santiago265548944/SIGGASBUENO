import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DsetaEditorComponent } from './dseta-editor.component';

describe('DsetaEditorComponent', () => {
  let component: DsetaEditorComponent;
  let fixture: ComponentFixture<DsetaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DsetaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DsetaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
