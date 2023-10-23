import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RisksManagementComponent } from './risks-management.component';

describe('RisksManagementComponent', () => {
  let component: RisksManagementComponent;
  let fixture: ComponentFixture<RisksManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RisksManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RisksManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
