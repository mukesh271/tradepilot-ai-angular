import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RiskSettingsService } from './risk-settings.service';
import { environment } from '../../../environments/environment';
import { HttpTestingController } from '@angular/common/http/testing';

describe('RiskSettingsService', () => {
  let service: RiskSettingsService;
  let http: HttpTestingController;
  let originalMockSetting: boolean;

  beforeEach(() => {
    originalMockSetting = environment.useMockData;
    environment.useMockData = true;
    TestBed.configureTestingModule({
      providers: [RiskSettingsService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RiskSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    environment.useMockData = originalMockSetting;
    http.verify();
  });

  it('should return the default mock settings', () => {
    service.getRiskSettings().subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(response.data.tradingCapital).toBe(20000);
      expect(response.data.paperTradingEnabled).toBeTrue();
    });
  });

  it('should update settings successfully', () => {
    const updated = { id: 1, tradingCapital: 25000, riskPerTradePercent: 1.5, maximumDailyLossPercent: 2.5, minimumSignalScore: 80, paperTradingEnabled: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' };
    service.updateRiskSettings(updated).subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(response.data.tradingCapital).toBe(25000);
    });
  });

  it('binds the documented real API response to risk settings', (done) => {
    environment.useMockData = false;
    service.getRiskSettings().subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(response.data.tradingCapital).toBe(20000);
      expect(response.data.riskPerTradePercent).toBe(1);
      expect(response.data.paperTradingEnabled).toBeTrue();
      done();
    });

    const request = http.expectOne(`${environment.apiBaseUrl}/RiskSettings`);
    expect(request.request.method).toBe('GET');
    request.flush({
      success: true,
      data: {
        id: 1,
        tradingCapital: 20000,
        riskPerTradePercent: 1,
        maximumDailyLossPercent: 2,
        minimumSignalScore: 75,
        paperTradingEnabled: true,
        createdAtUtc: '2026-10-12T17:52:15.972346',
        updatedAtUtc: '2026-10-12T17:52:15.9735391'
      },
      message: null,
      errors: null
    });
  });

  it('surfaces an unsuccessful API envelope rather than an empty settings object', (done) => {
    environment.useMockData = false;
    service.getRiskSettings().subscribe({
      next: () => fail('Failure envelope should not be reported as settings data.'),
      error: (error: Error) => {
        expect(error.message).toContain('No settings row exists');
        done();
      }
    });
    http.expectOne(`${environment.apiBaseUrl}/RiskSettings`)
      .flush({ success: false, data: null, message: 'No settings row exists', errors: null });
  });
});
