import { TestBed, inject } from '@angular/core/testing';

import { ClassementCorpoJobService } from './classement-corpo-job.service';

describe('ClassementCorpoJobService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClassementCorpoJobService]
    });
  });

  it('should be created', inject([ClassementCorpoJobService], (service: ClassementCorpoJobService) => {
    expect(service).toBeTruthy();
  }));
});
