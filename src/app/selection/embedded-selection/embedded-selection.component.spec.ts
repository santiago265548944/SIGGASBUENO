import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddedSelectionComponent } from './embedded-selection.component';

describe('EmbeddedSelectionComponent', () => {
  let component: EmbeddedSelectionComponent;
  let fixture: ComponentFixture<EmbeddedSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbeddedSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddedSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
