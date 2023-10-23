import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeltaEditorComponent } from './delta-editor.component';

describe('DeltaEditorComponent', () => {
  let component: DeltaEditorComponent;
  let fixture: ComponentFixture<DeltaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeltaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeltaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
