import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { environment } from '../../../environments/environment';
import { TechnicalAnalysisResultDto } from '../models/technical-analysis.model';

describe('TechnicalAnalysisService', () => {
  let service: TechnicalAnalysisService;
  let http: HttpTestingController;
  let originalMockSetting: boolean;

  beforeEach(() => {
    originalMockSetting = environment.useMockData;
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TechnicalAnalysisService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    environment.useMockData = originalMockSetting;
    http.verify();
  });

  it('returns deterministic chronological OHLCV candles in mock mode', (done) => {
    environment.useMockData = true;

    service.getCandles(1, '15m', 200).subscribe((response) => {
      expect(response.success).toBeTrue();
      expect(response.data.length).toBe(200);
      expect(response.data[0].timestamp < response.data[199].timestamp).toBeTrue();
      expect(response.data.every((candle) => candle.high >= Math.max(candle.open, candle.close))).toBeTrue();
      expect(response.data.every((candle) => candle.low <= Math.min(candle.open, candle.close))).toBeTrue();
      expect(response.message).toContain('not live market data');
      done();
    });
  });

  it('returns illustrative mock analysis without treating it as a prediction', (done) => {
    environment.useMockData = true;

    service.getAnalysis(1, '1h').subscribe((response) => {
      expect(response.data.indicators.length).toBe(13);
      expect(response.data.strategies.map((strategy) => strategy.name)).toEqual([
        'Breakout', 'Breakout + Volume', 'Trend Continuation', 'Support Reversal', 'Resistance Reversal'
      ]);
      expect(response.message).toContain('not a prediction');
      expect(response.data.strategies[0].status).toBe('Incomplete');
      done();
    });
  });

  it('calls the real candle endpoint with documented query parameters and maps CandleDto', (done) => {
    environment.useMockData = false;

    service.getCandles(5, '5m', 200).subscribe((response) => {
      expect(response.data[0]).toEqual({
        id: 8,
        instrumentId: 5,
        timeframe: '5m',
        timestamp: '2025-06-01T09:15:00Z',
        open: 100.25,
        high: 101,
        low: 99.8,
        close: 100.75,
        volume: 15230
      });
      done();
    });

    const request = http.expectOne((candidate) => candidate.url === `${environment.apiBaseUrl}/candles/5`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('timeframe')).toBe('5m');
    expect(request.request.params.get('limit')).toBe('200');
    request.flush({
      success: true,
      data: [{
        id: 8,
        instrumentId: 5,
        timeframe: '5m',
        timestampUtc: '2025-06-01T09:15:00Z',
        open: 100.25,
        high: 101,
        low: 99.8,
        close: 100.75,
        volume: 15230
      }],
      message: null,
      errors: null
    });
  });

  it('maps the documented flat analysis DTO, nullable indicators, and setup conditions', (done) => {
    environment.useMockData = false;

    service.getAnalysis(5, '5m').subscribe((response) => {
      const result = response.data;
      expect(result.symbol).toBe('RELIANCE');
      expect(result.lastClose).toBe(2456.3);
      expect(result.indicators.find((indicator) => indicator.key === 'sma20')?.value).toBe(2440.15);
      expect(result.indicators.find((indicator) => indicator.key === 'sma50')?.value).toBeNull();
      expect(result.strategies[0].status).toBe('Complete');
      expect(result.strategies[0].conditions[0].threshold).toBe(2450);
      expect(result.strategies[0].conditions[0].actualValue).toBe(2456.3);
      done();
    });

    const dto: TechnicalAnalysisResultDto = {
      instrumentId: 5,
      symbol: 'RELIANCE',
      timeframe: '5m',
      lastCandleTimestampUtc: '2025-06-01T09:45:00Z',
      lastClose: 2456.3,
      sma20: 2440.15,
      sma50: null,
      ema9: 2451.2,
      ema21: 2435.6,
      rsi14: 62.4,
      macdLine: 5.2,
      macdSignal: 3.1,
      macdHistogram: 2.1,
      vwap: null,
      atr14: 12.35,
      volumeSma20: 18250,
      relativeVolume: 1.8,
      createdAtUtc: '2025-06-01T09:46:02Z',
      setups: [{
        strategyName: 'Breakout',
        direction: 'Bullish',
        conditions: [{
          name: 'Close above prior 20-candle high',
          passed: true,
          explanation: 'Close is above the prior high.',
          actualValue: 2456.3,
          expectedValue: 2450
        }],
        conditionsPassed: 1,
        totalConditions: 1,
        status: 'Complete',
        explanation: 'Research candidate only.'
      }]
    };
    const request = http.expectOne(`${environment.apiBaseUrl}/analysis/5?timeframe=5m`);
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: dto, message: null, errors: null });
  });

  it('uses the documented history, calculate, and import routes when mock mode is off', () => {
    environment.useMockData = false;
    service.getAnalysisHistory(5, '15m', 50).subscribe();
    service.calculateAnalysis(5, '15m', { limit: 300, relativeVolumeThreshold: 1.5, breakoutLookback: 20 }).subscribe();
    service.importCandles(5, [{
      timestampUtc: '2025-06-01T09:15:00Z',
      timeframe: '5m',
      open: 100,
      high: 101,
      low: 99,
      close: 100.5,
      volume: 150
    }]).subscribe();

    const history = http.expectOne(`${environment.apiBaseUrl}/analysis/5/history?timeframe=15m&limit=50`);
    expect(history.request.method).toBe('GET');
    history.flush({ success: true, data: [], message: null, errors: null });

    const calculate = http.expectOne(`${environment.apiBaseUrl}/analysis/5/calculate`);
    expect(calculate.request.method).toBe('POST');
    expect(calculate.request.body).toEqual({
      timeframe: '15m',
      limit: 300,
      relativeVolumeThreshold: 1.5,
      breakoutLookback: 20
    });
    calculate.flush({ success: true, data: {
      instrumentId: 5,
      symbol: 'RELIANCE',
      timeframe: '15m',
      lastCandleTimestampUtc: '2025-06-01T09:45:00Z',
      lastClose: 100.5,
      sma20: null,
      sma50: null,
      ema9: null,
      ema21: null,
      rsi14: null,
      macdLine: null,
      macdSignal: null,
      macdHistogram: null,
      vwap: null,
      atr14: null,
      volumeSma20: null,
      relativeVolume: null,
      createdAtUtc: '2025-06-01T09:46:02Z',
      setups: []
    }, message: null, errors: null });

    const importRequest = http.expectOne(`${environment.apiBaseUrl}/candles/import?instrumentId=5`);
    expect(importRequest.request.method).toBe('POST');
    expect(importRequest.request.body.candles.length).toBe(1);
    importRequest.flush({ success: true, data: { requested: 1, imported: 1, skipped: 0, errors: [] }, message: null, errors: null });
  });

  it('does not return successful mock data when the API envelope reports failure', (done) => {
    environment.useMockData = false;
    service.getCandles(5, '15m').subscribe({
      next: () => fail('A failure envelope must not be treated as successful data.'),
      error: (error: Error) => {
        expect(error.message).toContain('unsupported timeframe');
        done();
      }
    });
    http.expectOne((request) => request.url.endsWith('/candles/5'))
      .flush({ success: false, data: null, message: 'Bad request.', errors: ['unsupported timeframe'] });
  });
});
