import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeStratumComponent } from './change-stratum.component';

describe('ChangeStratumComponent', () => {
  let component: ChangeStratumComponent;
  let fixture: ComponentFixture<ChangeStratumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeStratumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeStratumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
