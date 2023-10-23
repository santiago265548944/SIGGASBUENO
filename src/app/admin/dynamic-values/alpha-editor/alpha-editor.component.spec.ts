import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphaEditorComponent } from './alpha-editor.component';

describe('AlphaEditorComponent', () => {
  let component: AlphaEditorComponent;
  let fixture: ComponentFixture<AlphaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlphaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlphaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
