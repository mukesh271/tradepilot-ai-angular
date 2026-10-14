import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { Instrument, InstrumentType } from '../../core/models/instrument.model';
import { ApiResponse } from '../../core/models/api-response.model';
import { Candle, TechnicalAnalysis } from '../../core/models/technical-analysis.model';
import { InstrumentService } from '../../core/services/instrument.service';
import { NotificationService } from '../../core/services/notification.service';
import { TechnicalAnalysisService } from '../../core/services/technical-analysis.service';
import { RiskSettingsService } from '../../core/services/risk-settings.service';
import { createMockAnalysis, createMockCandles } from '../../core/services/technical-analysis-mock-data';
import { TechnicalAnalysisComponent } from './technical-analysis.component';

const instruments: Instrument[] = [
  { id: 1, symbol: 'NIFTY', exchange: 'NSE', type: InstrumentType.Future, isActive: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' },
  { id: 2, symbol: 'RELIANCE', exchange: 'NSE', type: InstrumentType.Equity, isActive: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' }
];

describe('TechnicalAnalysisComponent', () => {
  let fixture: ComponentFixture<TechnicalAnalysisComponent>;
  let getCandles: jasmine.Spy;
  let getAnalysis: jasmine.Spy;
  let calculateAnalysis: jasmine.Spy;

  const analysisResponse = (data: TechnicalAnalysis): ApiResponse<TechnicalAnalysis> => ({ success: true, data });
  const candleResponse = (data: Candle[]): ApiResponse<Candle[]> => ({ success: true, data });

  beforeEach(async () => {
    getCandles = jasmine.createSpy('getCandles').and.returnValue(of(candleResponse(createMockCandles('15m', 3))));
    getAnalysis = jasmine.createSpy('getAnalysis').and.returnValue(of(analysisResponse(createMockAnalysis('15m', createMockCandles('15m', 3)))));
    calculateAnalysis = jasmine.createSpy('calculateAnalysis').and.returnValue(of(analysisResponse(createMockAnalysis('15m', createMockCandles('15m', 60)))));

    await TestBed.configureTestingModule({
      imports: [TechnicalAnalysisComponent],
      providers: [
        { provide: InstrumentService, useValue: { getInstruments: () => of({ success: true, data: instruments }) } },
        { provide: TechnicalAnalysisService, useValue: { getCandles, getAnalysis, calculateAnalysis } },
        {
          provide: RiskSettingsService,
          useValue: {
            getRiskSettings: () => of({
              success: true,
              data: {
                id: 1,
                tradingCapital: 20000,
                riskPerTradePercent: 1,
                maximumDailyLossPercent: 2,
                minimumSignalScore: 75,
                paperTradingEnabled: true,
                createdAtUtc: '2025-01-01T00:00:00Z',
                updatedAtUtc: '2025-01-01T00:00:00Z'
              }
            })
          }
        },
        { provide: NotificationService, useValue: { success: jasmine.createSpy('success') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TechnicalAnalysisComponent);
    fixture.detectChanges();
  });

  it('loads instruments and allows changing the instrument and timeframe', async () => {
    expect(fixture.componentInstance.selectedInstrumentId).toBe(1);
    const selects = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    selects[0].selectedIndex = 2;
    selects[0].dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedInstrumentId).toBe(2);
    expect(getCandles).toHaveBeenCalledWith(2, '15m');

    selects[1].selectedIndex = 1;
    selects[1].dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedTimeframe).toBe('5m');
    expect(getCandles).toHaveBeenCalledWith(2, '5m');
  });

  it('shows the paper-trading status returned by Risk Settings, independently of mock mode', () => {
    const status = fixture.nativeElement.querySelector('.paper-mode') as HTMLElement;
    expect(status.textContent).toContain('PAPER TRADING ENABLED');
  });

  it('shows loading state while requests are pending', () => {
    getCandles.and.returnValue(NEVER);
    fixture.componentInstance.onTimeframeChange();
    fixture.detectChanges();
    expect(fixture.componentInstance.isLoading).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Loading candles and analysis');
  });

  it('reports request errors and supports retry', () => {
    getCandles.and.returnValue(throwError(() => new Error('API unavailable')));
    fixture.componentInstance.retry();
    fixture.detectChanges();
    expect(fixture.componentInstance.isLoading).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('API unavailable');
  });

  it('shows the empty history state and does not allow analysis without candles', () => {
    getCandles.and.returnValue(of(candleResponse([])));
    fixture.componentInstance.onTimeframeChange();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No candles available');
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });

  it('displays strategy conditions and never upgrades an incomplete status', () => {
    const data: TechnicalAnalysis = {
      timeframe: '15m',
      latestCandleAt: '2025-01-10T15:30:00.000Z',
      lastClose: 25100,
      indicators: [{ key: 'rsi14', label: 'RSI14', value: null, description: 'Momentum measure.' }],
      strategies: [{
        name: 'Breakout',
        status: 'incomplete',
        conditionsPassed: 1,
        conditionsTotal: 2,
        conditions: [
          { name: 'Close above resistance', passed: true, actualValue: 25100, threshold: 25000 },
          { name: 'Volume confirmation', passed: false, explanation: 'Volume was below threshold.' }
        ]
      }],
      warnings: [],
      insufficientData: false
    };
    getAnalysis.and.returnValue(of(analysisResponse(data)));
    fixture.componentInstance.onTimeframeChange();
    fixture.detectChanges();

    const strategy = fixture.nativeElement.querySelector('details') as HTMLDetailsElement;
    strategy.open = true;
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('incomplete');
    expect(text).toContain('1 / 2 conditions');
    expect(text).toContain('Actual: 25100');
    expect(text).toContain('Threshold: 25000');
    expect(text).toContain('Volume was below threshold.');
    expect(text).toContain('N/A');
  });

  it('runs analysis only with candle history and reports success', () => {
    fixture.componentInstance.runAnalysis();
    fixture.detectChanges();

    expect(calculateAnalysis).toHaveBeenCalledWith(1, '15m');
    expect(fixture.componentInstance.isCalculating).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Run Analysis');
  });

  it('surfaces analysis errors and supports retry', () => {
    calculateAnalysis.and.returnValue(throwError(() => new Error('Calculation failed')));
    fixture.componentInstance.runAnalysis();
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage).toBe('Calculation failed');
    expect(fixture.nativeElement.textContent).toContain('Retry');
  });
});
