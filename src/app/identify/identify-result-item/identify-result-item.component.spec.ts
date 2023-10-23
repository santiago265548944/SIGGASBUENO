import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyResultItemComponent } from './identify-result-item.component';

describe('IdentifyResultItemComponent', () => {
  let component: IdentifyResultItemComponent;
  let fixture: ComponentFixture<IdentifyResultItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentifyResultItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentifyResultItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
