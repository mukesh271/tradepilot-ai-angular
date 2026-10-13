import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RiskSettingsComponent } from './risk-settings.component';
import { RiskSettingsService } from '../../core/services/risk-settings.service';

describe('RiskSettingsComponent', () => {
  let component: RiskSettingsComponent;
  let fixture: ComponentFixture<RiskSettingsComponent>;

  const riskSettingsServiceMock = {
    getRiskSettings: () => of({ success: true, data: { id: 1, tradingCapital: 20000, riskPerTradePercent: 1, maximumDailyLossPercent: 2, minimumSignalScore: 75, paperTradingEnabled: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' } }),
    updateRiskSettings: () => of({ success: true, data: { id: 1, tradingCapital: 20000, riskPerTradePercent: 1, maximumDailyLossPercent: 2, minimumSignalScore: 75, paperTradingEnabled: true, createdAtUtc: '2025-01-01T00:00:00Z', updatedAtUtc: '2025-01-01T00:00:00Z' } })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskSettingsComponent],
      providers: [{ provide: RiskSettingsService, useValue: riskSettingsServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(RiskSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be invalid with non-positive trading capital', () => {
    component.form.patchValue({ tradingCapital: 0, riskPerTradePercent: 1, maximumDailyLossPercent: 2, minimumSignalScore: 75 });
    expect(component.form.valid).toBeFalse();
  });

  it('should allow a valid settings form', () => {
    component.form.patchValue({ tradingCapital: 25000, riskPerTradePercent: 1.5, maximumDailyLossPercent: 3, minimumSignalScore: 80, paperTradingEnabled: true });
    expect(component.form.valid).toBeTrue();
  });
});
