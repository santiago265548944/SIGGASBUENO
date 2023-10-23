import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EsriTocComponent } from './esri-toc.component';

describe('EsriTocComponent', () => {
  let component: EsriTocComponent;
  let fixture: ComponentFixture<EsriTocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EsriTocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EsriTocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
