import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBudgetComponent } from './project-budget.component';

describe('ProjectBudgetComponent', () => {
  let component: ProjectBudgetComponent;
  let fixture: ComponentFixture<ProjectBudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
