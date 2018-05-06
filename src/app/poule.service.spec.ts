import { TestBed, inject } from '@angular/core/testing';

import { PouleService } from './poule.service';

describe('PouleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PouleService]
    });
  });

  it('should be created', inject([PouleService], (service: PouleService) => {
    expect(service).toBeTruthy();
  }));
});
