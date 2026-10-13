import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SignalService } from './signal.service';

describe('SignalService', () => {
  let service: SignalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SignalService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SignalService);
  });

  it('should return mock signals successfully', () => {
    service.getSignals().subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  it('should return an empty set when minimum score is too high', () => {
    service.getSignals(999).subscribe((response) => {
      expect(response.data.length).toBe(0);
    });
  });
});
