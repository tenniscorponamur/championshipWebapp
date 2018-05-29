import { TestBed, inject } from '@angular/core/testing';

import { RencontreService } from './rencontre.service';

describe('RencontreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RencontreService]
    });
  });

  it('should be created', inject([RencontreService], (service: RencontreService) => {
    expect(service).toBeTruthy();
  }));
});
