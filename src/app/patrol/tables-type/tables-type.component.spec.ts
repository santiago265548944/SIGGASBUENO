import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesTypeComponent } from './tables-type.component';

describe('TablesTypeComponent', () => {
  let component: TablesTypeComponent;
  let fixture: ComponentFixture<TablesTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablesTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablesTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
