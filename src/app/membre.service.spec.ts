import { TestBed, inject } from '@angular/core/testing';

import { MembreService } from './membre.service';

describe('MembreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MembreService]
    });
  });

  it('should be created', inject([MembreService], (service: MembreService) => {
    expect(service).toBeTruthy();
  }));
});
