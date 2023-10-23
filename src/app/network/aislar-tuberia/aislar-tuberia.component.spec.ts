import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AislarTuberiaComponent } from './aislar-tuberia.component';

describe('AislarTuberiaComponent', () => {
  let component: AislarTuberiaComponent;
  let fixture: ComponentFixture<AislarTuberiaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AislarTuberiaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AislarTuberiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
