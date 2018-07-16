import { TestBed, inject } from '@angular/core/testing';

import { ClassementMembreService } from './classement-membre.service';

describe('ClassementMembreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClassementMembreService]
    });
  });

  it('should be created', inject([ClassementMembreService], (service: ClassementMembreService) => {
    expect(service).toBeTruthy();
  }));
});
