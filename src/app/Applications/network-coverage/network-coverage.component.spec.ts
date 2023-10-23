import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkCoverageComponent } from './network-coverage.component';

describe('NetworkCoverageComponent', () => {
  let component: NetworkCoverageComponent;
  let fixture: ComponentFixture<NetworkCoverageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkCoverageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
