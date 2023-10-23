import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GammaEditorComponent } from './gamma-editor.component';

describe('GammaEditorComponent', () => {
  let component: GammaEditorComponent;
  let fixture: ComponentFixture<GammaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GammaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GammaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
