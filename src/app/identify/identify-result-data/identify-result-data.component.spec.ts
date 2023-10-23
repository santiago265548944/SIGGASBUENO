import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyResultDataComponent } from './identify-result-data.component';

describe('IdentifyResultDataComponent', () => {
  let component: IdentifyResultDataComponent;
  let fixture: ComponentFixture<IdentifyResultDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentifyResultDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentifyResultDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
