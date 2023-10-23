import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpatialRelationComponent } from './spatial-relation.component';

describe('SpatialRelationComponent', () => {
  let component: SpatialRelationComponent;
  let fixture: ComponentFixture<SpatialRelationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpatialRelationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpatialRelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
