import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditableGridComponent } from './admin-editable-grid.component';

describe('AdminEditableGridComponent', () => {
  let component: AdminEditableGridComponent;
  let fixture: ComponentFixture<AdminEditableGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminEditableGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditableGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
