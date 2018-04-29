import { TestBed, inject } from '@angular/core/testing';

import { ChampionnatService } from './championnat.service';

describe('ChampionnatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChampionnatService]
    });
  });

  it('should be created', inject([ChampionnatService], (service: ChampionnatService) => {
    expect(service).toBeTruthy();
  }));
});
