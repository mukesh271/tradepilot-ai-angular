import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { PerformanceService } from './performance.service';

describe('PerformanceService', () => {
  let service: PerformanceService;
  let http: HttpTestingController;
  let originalMockSetting: boolean;

  beforeEach(() => {
    originalMockSetting = environment.useMockData;
    TestBed.configureTestingModule({ providers: [PerformanceService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PerformanceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    environment.useMockData = originalMockSetting;
    http.verify();
  });

  it('binds the aggregate performance DTO as an object', (done) => {
    environment.useMockData = false;
    service.getPerformance().subscribe((response) => {
      expect(response.data.totalTrades).toBe(20);
      expect(response.data.totalNetProfitLoss).toBe(4500);
      expect(response.data.maximumDrawdown).toBe(1200);
      done();
    });
    const request = http.expectOne(`${environment.apiBaseUrl}/performance`);
    request.flush({
      success: true,
      data: {
        calculatedAtUtc: '2026-10-12T17:52:15Z',
        totalTrades: 20,
        winningTrades: 12,
        losingTrades: 8,
        winRate: 60,
        profitFactor: 1.85,
        totalNetProfitLoss: 4500,
        averageWinningTrade: 650,
        averageLosingTrade: -350,
        maximumDrawdown: 1200
      },
      message: null,
      errors: null
    });
  });
});
