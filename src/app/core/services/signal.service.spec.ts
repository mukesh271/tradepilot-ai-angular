import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SignalService } from './signal.service';
import { environment } from '../../../environments/environment';

describe('SignalService', () => {
  let service: SignalService;
  let http: HttpTestingController;
  let originalMockSetting: boolean;

  beforeEach(() => {
    originalMockSetting = environment.useMockData;
    environment.useMockData = true;
    TestBed.configureTestingModule({
      providers: [SignalService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SignalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    environment.useMockData = originalMockSetting;
    http.verify();
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

  it('maps the documented flat signal response and string filters', (done) => {
    environment.useMockData = false;
    service.getSignals(75, 'Active', 'RELIANCE').subscribe((response) => {
      expect(response.data[0].instrumentSymbol).toBe('RELIANCE');
      expect(response.data[0].strategyName).toBe('Breakout');
      expect(response.data[0].statusLabel).toBe('Active');
      expect(response.data[0].conditions?.[0].signalId).toBe(10);
      done();
    });

    const request = http.expectOne((candidate) => candidate.url === `${environment.apiBaseUrl}/signals`);
    expect(request.request.params.get('minimumScore')).toBe('75');
    expect(request.request.params.get('status')).toBe('Active');
    expect(request.request.params.get('instrument')).toBe('RELIANCE');
    request.flush({
      success: true,
      data: [{
        id: 10,
        instrumentId: 1,
        instrumentSymbol: 'RELIANCE',
        strategyId: 1,
        strategyName: 'Breakout',
        direction: 'Bullish',
        signalScore: 82.5,
        entryPrice: 2456.3,
        stopLoss: 2430,
        target: 2510,
        riskRewardRatio: 2.03,
        timeFrame: '5m',
        explanation: 'Test',
        status: 'Active',
        createdAtUtc: '2026-10-12T17:52:15Z',
        expiresAtUtc: null,
        conditions: [{
          id: 1,
          name: 'RSI > 60',
          score: 20,
          passed: true,
          explanation: 'Passed',
          createdAtUtc: '2026-10-12T17:52:15Z'
        }]
      }],
      message: null,
      errors: null
    });
  });
});
