import { TestBed, inject } from '@angular/core/testing';

import { TraceService } from './trace.service';

describe('TraceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TraceService]
    });
  });

  it('should be created', inject([TraceService], (service: TraceService) => {
    expect(service).toBeTruthy();
  }));
});
