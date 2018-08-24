import { TestBed, inject } from '@angular/core/testing';

import { LocaliteService } from './localite.service';

describe('LocaliteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocaliteService]
    });
  });

  it('should be created', inject([LocaliteService], (service: LocaliteService) => {
    expect(service).toBeTruthy();
  }));
});
