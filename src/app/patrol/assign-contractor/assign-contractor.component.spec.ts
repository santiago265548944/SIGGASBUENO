import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignContractorComponent } from './assign-contractor.component';

describe('AssignContractorComponent', () => {
  let component: AssignContractorComponent;
  let fixture: ComponentFixture<AssignContractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignContractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
