import { TestBed, inject } from '@angular/core/testing';

import { AlertesService } from './alertes.service';

describe('AlertesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlertesService]
    });
  });

  it('should be created', inject([AlertesService], (service: AlertesService) => {
    expect(service).toBeTruthy();
  }));
});
