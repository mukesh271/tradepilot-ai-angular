import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { RiskSettingsService } from '../../core/services/risk-settings.service';
import { SignalService } from '../../core/services/signal.service';
import { PaperTradeService } from '../../core/services/paper-trade.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const riskSettingsServiceMock = {
    getRiskSettings: () => of({ success: true, data: { id: 1, tradingCapital: 20000, riskPerTradePercent: 1, maximumDailyLossPercent: 2, minimumSignalScore: 75, paperTradingEnabled: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' } })
  };

  const signalServiceMock = {
    getSignals: () => of({ success: true, data: [{ id: 1, instrumentId: 1, strategyId: 1, direction: 1, signalScore: 83, entryPrice: 25000, stopLoss: 24900, target: 25200, riskRewardRatio: 2, timeFrame: '15M', explanation: 'Test signal', status: 1, createdAtUtc: '2025-01-01T00:00:00Z' }] })
  };

  const paperTradeServiceMock = {
    getPaperTrades: () => of({ success: true, data: [{ id: 1, signalId: 1, entryPrice: 25000, quantity: 10, status: 1, createdAtUtc: '2025-01-01T00:00:00Z' }] })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: RiskSettingsService, useValue: riskSettingsServiceMock },
        { provide: SignalService, useValue: signalServiceMock },
        { provide: PaperTradeService, useValue: paperTradeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display no trading history yet when no performance is available', () => {
    expect(fixture.nativeElement.textContent).toContain('No trading history yet');
  });
});
