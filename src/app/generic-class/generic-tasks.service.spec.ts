import { TestBed, inject } from '@angular/core/testing';

import { GenericTasksService } from './generic-tasks.service';

describe('GenericTasksService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenericTasksService]
    });
  });

  it('should be created', inject([GenericTasksService], (service: GenericTasksService) => {
    expect(service).toBeTruthy();
  }));
});
