import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RiskSettingsService } from './risk-settings.service';

describe('RiskSettingsService', () => {
  let service: RiskSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RiskSettingsService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RiskSettingsService);
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
});
