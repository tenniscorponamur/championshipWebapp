import { TestBed, inject } from '@angular/core/testing';

import { RequestInterceptorService } from './request-interceptor.service';

describe('RequestInterceptorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequestInterceptorService]
    });
  });

  it('should be created', inject([RequestInterceptorService], (service: RequestInterceptorService) => {
    expect(service).toBeTruthy();
  }));
});
